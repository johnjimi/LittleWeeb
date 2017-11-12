using System;
using System.Diagnostics;
using SimpleIRCLib;
using System.IO;
using System.Threading;
using Microsoft.WindowsAPICodePack.Dialogs;
using WebSocketSharp.Server;
using WebSocketSharp;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace LittleWeeb
{
    class WebSocketHandler : WebSocketBehavior
    {
        private SimpleIRC irc;
        private Form1 form;
        private Thread checkMessagesToSend = null;
        private UtitlityMethods utilityMethods = null;

        public WebSocketHandler() 
        {
            this.form = Form1.form;
            irc = SharedData.irc;
            utilityMethods = new UtitlityMethods();
            SharedData.AddToMessageList("HELLO LITTLE WEEB");
            checkMessagesToSend = new Thread(new ThreadStart(messagesToSend));
            checkMessagesToSend.Start();
        }
        
        private void messagesToSend()
        {
            while(SharedData.messageToSendWS != null)
            {
                Thread.Sleep(100);
                string messageToSend = SharedData.getAndRemoveFromMessageList();
                if (messageToSend != "" && messageToSend != null)
                {
                    while (true)
                    {
                        try
                        {
                            Send(messageToSend);
                            //Debug.WriteLine("DEBUG-WEBSOCKETHANDLER - MSG SEND: " + messageToSend);
                            break;
                        }
                        catch (Exception e)
                        {
                            Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: COULD NOT SEND DATA: " + messageToSend);
                            Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: COULD NOT SEND DATA: " + e.ToString());
                        }
                    }
                    
                }

            }

        }

        protected override void OnClose(CloseEventArgs e)
        {
            checkMessagesToSend.Abort();
        }

        private void getIrcData()
        {
            JsonIrcUpdate update = new JsonIrcUpdate();
            update.connected = true;
            update.downloadlocation = SharedData.currentDownloadLocation;
            try
            {
                update.server = SharedData.irc.newIP + ":" + SharedData.irc.newPort;
                update.user = SharedData.irc.newUsername;
                update.channel = SharedData.irc.newChannel;

            } catch (Exception e)
            {
                Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: no irc connection yet.");
                update.server = "";
                update.user = "";
                update.channel = "";
            }
            SharedData.AddToMessageList(JsonConvert.SerializeObject(update, Formatting.Indented));
        }

        private void getDownloads()
        {
            string[] filePaths = Directory.GetFiles(SharedData.currentDownloadLocation);
            int a = 0;
            JsonAlreadyDownloaded alreadyDownloadedList = new JsonAlreadyDownloaded();

            List<JsonDownloadUpdate> listWithFiles = new List<JsonDownloadUpdate>();

            foreach (string filePath in filePaths)
            {
                if (utilityMethods.IsMediaFile(filePath)){

                    string filename = Path.GetFileName(filePath);
                    FileInfo info = new FileInfo(filePath);
                    int filesize = (int)(info.Length / 1048576);

                    JsonDownloadUpdate alreadyDownloaded = new JsonDownloadUpdate();
                    alreadyDownloaded.id = a.ToString();
                    alreadyDownloaded.progress = "100";
                    alreadyDownloaded.speed = "0";
                    alreadyDownloaded.status = "ALREADYDOWNLOADED";
                    alreadyDownloaded.filename = filename;
                    alreadyDownloaded.filesize = filesize.ToString();
                    listWithFiles.Add(alreadyDownloaded);

                    a++;
                }
            }
            alreadyDownloadedList.alreadyDownloaded = listWithFiles;

            SharedData.AddToMessageList(JsonConvert.SerializeObject(alreadyDownloadedList, Formatting.Indented));
        }

        private void addDownload(dynamic download)
        {
            
            try
            {
                string dlId = download.id.ToString();
                string dlPack = download.pack.ToString();
                string dlBot = download.bot.ToString();

                dlData d = new dlData();
                d.dlId = dlId;
                d.dlBot = dlBot;
                d.dlPack = dlPack;
                d.dlIndex = SharedData.downloadList.Count;
                SharedData.AddToDownloadList(d);

                //Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:DONE ADDING BATCH TO DOWLOADS: ID:" + dlId + " XDCC: /msg " + dlBot + " xdcc send #" + dlPack);

            }
            catch (Exception ex)
            {
                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + ex.ToString());
            }
        }

        private void abortDownload()
        {
            try
            {
                SharedData.irc.stopXDCCDownload();
            }
            catch
            {
                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ERROR: tried to stop download but there isn't anything downloading or no connection to irc");
            }
        }

        private void deleteDownload(dynamic download)
        {
            string dlId = download.id;
            string fileName = download.filename;
            if (SharedData.currentDownloadId == dlId)
            {
                SharedData.removeIfDownloadIsInDownloadList(dlId);
                try
                {
                    //Debug.WriteLine("I guess I should Delete stuff");
                    SharedData.irc.stopXDCCDownload();

                }
                catch
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ERROR: tried to stop download but there isn't anything downloading or no connection to irc");
                }
            }
            else
            {
                // Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: QUEU LENGTH BEFORE REMOVING: " + SharedData.downloadList.Count);

                SharedData.removeIfDownloadIsInDownloadList(dlId);
                // Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: QUEU LENGTH AFTER REMOVING: " + SharedData.downloadList.Count);


                try
                {
                    // Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: YOU MORON... no actually, THIS SHOULD ONLY HAPPEN... well.. when you actually want to delete stuff x)");
                    File.Delete(SharedData.currentDownloadLocation + "\\" + fileName);
                }
                catch (IOException ex)
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ERROR:  We've got a problem :( -> " + ex.ToString());
                }
            }
        }

        private void openDownloadDirectory()
        {
            Process.Start(SharedData.currentDownloadLocation);
        }

        private void setDownloadDirectory()
        {
            try
            {
                // Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: opening file dialog.");
                setDlDir();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + ex.ToString());
            }
        }

        private void playFile(dynamic download)
        {
            string fileName = download.filename;
            string fileLocation = Path.Combine(SharedData.currentDownloadLocation, fileName);
            try
            {
                // Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: Trying to open file: " + fileLocation);
                Thread player = new Thread(new ThreadStart(delegate
                {
                    Process.Start(fileLocation);
                }));
                player.Start();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: We've got another problem: " + ex.ToString());
            }
        }

        private void closeEverything()
        {
            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: CLOSING SHIT");
            SharedData.closeBackend = true;
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            var json = JsonConvert.DeserializeObject<dynamic>(e.Data);
            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: " + ((object)JsonConvert.SerializeObject(json)).ToString());

            switch (json.action.ToString())
            {
                case "get_irc_data":
                    getIrcData();
                    break;
                case "get_downloads":
                    getDownloads();
                    break;
                case "add_download":
                    addDownload(json.extra);
                    break;
                case "abort_download":
                    abortDownload();
                    break;
                case "delete_download":
                    deleteDownload(json.extra);
                    break;
                case "open_download_directory":
                    openDownloadDirectory();
                    break;
                case "set_download_directory":
                    setDownloadDirectory();
                    break;
                case "play_file":
                    playFile(json.extra);
                    break;
                case "close":
                    closeEverything();
                    break;
                default:
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: RECEIVED UNKNOWN JSON ACTION: " + ((object)json.action).ToString());
                    break;
               
            }
        }

        private void setDlDir()
        {
            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: TRYING TO OPEN FILE DIALOG");
            UtitlityMethods stff = new UtitlityMethods();
            stff.InvokeIfRequired(form, () =>
            {
                try
                {
                    using (var fbd = new CommonOpenFileDialog())
                    {
                        fbd.InitialDirectory = "C:\\Users";
                        fbd.IsFolderPicker = true;

                        if (fbd.ShowDialog() == CommonFileDialogResult.Ok && !string.IsNullOrWhiteSpace(fbd.FileName))
                        {
                            SharedData.currentDownloadLocation = fbd.FileName;
                            SharedData.irc.setCustomDownloadDir(SharedData.currentDownloadLocation);
                           SharedData.AddToMessageList("CurrentDir^" + SharedData.currentDownloadLocation);
                            SharedData.settings.saveSettings();
                        }

                    }
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + e.ToString());
                }

            });

        }

    }
}
