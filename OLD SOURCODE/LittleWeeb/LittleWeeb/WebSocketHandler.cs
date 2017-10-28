using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SimpleIRCLib;
using System.IO;
using System.Threading;
using System.Net;
using Microsoft.WindowsAPICodePack.Dialogs;

namespace LittleWeeb
{
    class WebSocketHandler
    {
        private SimpleWebSockets websocketserver;
        private SimpleIRC irc;
        private SharedData shared;
        private Form1 form;
        public WebSocketHandler(SharedData shared, Form1 form) {
            this.shared = shared;
            this.form = form;
            irc = shared.irc;
            websocketserver = shared.websocketserver;
            websocketserver.MessageReceived += new EventHandler<WebSocketEventArgs>(WsMessageReceived);
            websocketserver.DebugMessage += new EventHandler<WebSocketEventArgs>(WsDebugReceived);
            websocketserver.Start();
            websocketserver.SendGlobalMessage("HELLO LITTLE WEEB");
        }

        public void Shutdown()
        {
            websocketserver.Stop();
        }

        private void WsMessageReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Debug.WriteLine("WSDEBUG: " + msg);
            if (msg.Contains("AreWeJoined"))
            {
                if (shared.joinedChannel)
                {
                    websocketserver.SendGlobalMessage("IrcConnected");
                }
            }
            if (msg.Contains("GetAlreadyDownloadedFiles"))
            {
                string[] filePaths = Directory.GetFiles(shared.currentDownloadLocation);
                string arrayToSend = "ALREADYDOWNLOADED";
                int a = 0;
                foreach (string filePath in filePaths)
                {
                    string filename = Path.GetFileName(filePath);
                    FileInfo info = new FileInfo(filePath);
                    int filesize = (int)(info.Length / 1048576);

                    arrayToSend = arrayToSend + "," + a.ToString() + ":100:0:COMPLETED:" + filename + ":" + filesize.ToString();

                    a++;
                }

                websocketserver.SendGlobalMessage(arrayToSend);

            }
            if (msg.Contains("AddToDownloads"))
            {
                Debug.WriteLine("DOWNLOAD REQUEST:" + msg);
                if (msg.Contains(","))
                {
                    string[] bulkDownloads = msg.Split(',');
                    foreach (string download in bulkDownloads)
                    {
                        string[] data = download.Split(':');
                        try
                        {
                            string dlId = data[0];
                            string dlPack = data[1];
                            string dlBot = data[2];
                            Debug.WriteLine("ADDING TO DOWLOADS: " + dlId + " /msg " + dlBot + " xdcc send #" + dlPack);
                            dlData d = new dlData();
                            d.dlId = dlId;
                            d.dlBot = dlBot;
                            d.dlPack = dlPack;
                            shared.downloadList.Add(d);
                        }
                        catch(Exception e)
                        {
                            Debug.WriteLine("DEBUG:ERROR: " + e.ToString());
                        }

                    }
                }
                else
                {

                    string[] data = msg.Split(':');
                    string dlId = data[1];
                    string dlPack = data[2];
                    string dlBot = data[3];
                    Debug.WriteLine("ADDING TO DOWLOADS: " + dlId + " /msg " + dlBot + " xdcc send #" + dlPack);
                    dlData d = new dlData();
                    d.dlId = dlId;
                    d.dlBot = dlBot;
                    d.dlPack = dlPack;
                    shared.downloadList.Add(d);
                }
            }
            if (msg.Contains("AbortDownload"))
            {
                try
                {
                    irc.stopXDCCDownload();
                }
                catch
                {
                    Debug.WriteLine("DEBUG: ERROR: tried to stop download but there isn't anything downloading or no connection to irc");
                }
            }
            if (msg.Contains("DeleteDownload"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2];
                if (shared.currentDownloadId == dlId)
                {
                    try
                    {
                        Debug.WriteLine("I guess I should Delete stuff");
                        irc.stopXDCCDownload();
                    }
                    catch
                    {
                        Debug.WriteLine("DEBUG: ERROR: tried to stop download but there isn't anything downloading or no connection to irc");
                    }
                }
                else
                {
                    int index = 0;
                    foreach (dlData data in shared.downloadList)
                    {
                        if (data.dlId == dlId)
                        {
                            shared.downloadList.Remove(data);
                            break;
                        }
                        index++;
                    }

                    try
                    {
                        Debug.WriteLine("DEBUG: YOU MORON... no actually, THIS SHOULD ONLY HAPPEN... well.. when you actually want to delete stuff x)");
                        File.Delete(shared.currentDownloadLocation + "\\" + fileName);
                    }
                    catch (IOException e)
                    {
                        Debug.WriteLine("DEBUG: ERROR:  We've got a problem :( -> " + e.ToString());
                    }
                }
            }
            if (msg.Contains("OpenDirectory"))
            {
                Process.Start(shared.currentDownloadLocation);
            }
            if (msg.Contains("OpenFileDialog"))
            {
                try
                {
                    Debug.WriteLine("DEBUG: opening file dialog.");
                    setDlDir();
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG:ERROR: " + e.ToString());
                }

            }
            if (msg.Contains("PlayFile"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2].Trim();
                string fileLocation = Path.Combine(shared.currentDownloadLocation, fileName);
                try
                {
                    Debug.WriteLine("DEBUG: Trying to open file: " + fileLocation);
                    Thread player = new Thread(new ThreadStart(delegate
                    {
                        Process.Start(fileLocation);
                    }));
                    player.Start();
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG:ERROR: We've got another problem: " + e.ToString());
                }
            }

            if (msg.Contains("GetCurrentDir"))
            {
                websocketserver.SendGlobalMessage("CurrentDir^" + shared.currentDownloadLocation);
            }

            
            if (msg.Contains("CLOSE"))
            {
                Debug.WriteLine("DEBUG: CLOSING SHIT");
                shared.closeBackend = true;
            }
        }

        private void WsDebugReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Debug.WriteLine("WSDEBUG: " + msg);
        }

        private void setDlDir()
        {
            Debug.WriteLine("DEBUG: TRYING TO OPEN FILE DIALOG");
            UsefullStuff stff = new UsefullStuff();
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
                            shared.currentDownloadLocation = fbd.FileName;
                            shared.irc.setCustomDownloadDir(shared.currentDownloadLocation);
                            websocketserver.SendGlobalMessage("CurrentDir^" + shared.currentDownloadLocation);
                            shared.settings.saveSettings();
                        }

                    }
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG:ERROR: " + e.ToString());
                }

            });

        }

    }
}
