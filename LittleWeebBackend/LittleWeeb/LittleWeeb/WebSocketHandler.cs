using System;
using System.Diagnostics;
using SimpleIRCLib;
using System.IO;
using System.Threading;
using Microsoft.WindowsAPICodePack.Dialogs;
using WebSocketSharp.Server;
using WebSocketSharp;

namespace LittleWeeb
{
    class WebSocketHandler : WebSocketBehavior
    {
        private SimpleIRC irc;
        private Form1 form;
        private Thread checkMessagesToSend = null;

        public WebSocketHandler() 
        {
            this.form = Form1.form;
            irc = SharedData.irc;
            Send("HELLO LITTLE WEEB");
            checkMessagesToSend = new Thread(new ThreadStart(messagesToSend));
            checkMessagesToSend.Start();
        }
        
        private void messagesToSend()
        {
            while(SharedData.messageToSendWS != null)
            {
                Thread.Sleep(1000);
                string messageToSend = "";
                SharedData.messageToSendWS.TryTake(out messageToSend);
                if(messageToSend != "")
                {
                    try
                    {
                        Send(messageToSend);
                    } catch(Exception e)
                    {
                        Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: COULD NOT SEND DATA: " + messageToSend);
                        Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: COULD NOT SEND DATA: " + e.ToString());
                    }
                }

            }

        }

        protected override void OnClose(CloseEventArgs e)
        {
            checkMessagesToSend.Abort();
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            string msg = e.Data;
            Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: " + msg);
            if (msg.Contains("AreWeJoined"))
            {
                if (SharedData.joinedChannel)
                {
                   Send("IrcConnected");
                }
            }
            if (msg.Contains("GetAlreadyDownloadedFiles"))
            {
                string[] filePaths = Directory.GetFiles(SharedData.currentDownloadLocation);
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

               Send(arrayToSend);

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
                            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ADDING TO DOWLOADS: ID:" + dlId + " XDCC: /msg " + dlBot + " xdcc send #" + dlPack);
                            dlData d = new dlData();
                            d.dlId = dlId;
                            d.dlBot = dlBot;
                            d.dlPack = dlPack;
                            SharedData.downloadList.Add(d);
                            dlData added = new dlData();
                            if( SharedData.downloadList.TryPeek(out added))
                            {
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ADDED TO DOWLOADS: ID:" + added.dlId + " XDCC: /msg " + added.dlBot + " xdcc send #" + added.dlPack);
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: SIZE OF QUEU:" + SharedData.downloadList.Count);
                            } else
                            {
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: I COULDN'T PEEK AFTER ADDING, SOMETHING MIGHT HAVE GONE WRONG :(");
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: SIZE OF QUEU:" + SharedData.downloadList.Count);
                            }
                        }
                        catch(Exception ex)
                        {
                            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + ex.ToString());
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
                    SharedData.downloadList.Add(d);
                }
            }
            if (msg.Contains("AbortDownload"))
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
            if (msg.Contains("DeleteDownload"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2];
                if (SharedData.currentDownloadId == dlId)
                {
                    try
                    {
                        Debug.WriteLine("I guess I should Delete stuff");
                        SharedData.irc.stopXDCCDownload();
                    }
                    catch
                    {
                        Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ERROR: tried to stop download but there isn't anything downloading or no connection to irc");
                    }
                }
                else
                {
                    int index = 0;

                    int removedItems = 0;
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: QUEU LENGTH BEFORE REMOVING: " + SharedData.downloadList.Count);
                    for (index = 0; index < SharedData.downloadList.Count; index++)
                    {
                        dlData toadd = new dlData();
                        if(SharedData.downloadList.TryTake(out toadd))
                        {
                            if(toadd.dlId != dlId)
                            {
                                SharedData.downloadList.Add(toadd);
                            } else
                            {
                                removedItems++;
                            }
                        }
                    }
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: QUEU LENGTH AFTER REMOVING: " + SharedData.downloadList.Count);
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: REMOVED " + removedItems + " ITEMS! THIS SHOULD EQUAL TO 1");
                    if(removedItems == 1)
                    {
                        Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ITEM HAS BEEN REMOVED");
                    } else
                    {
                        Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: SOMETHING WENT WRONG WHILE REMOVING:(");
                    }

                    try
                    {
                        Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: YOU MORON... no actually, THIS SHOULD ONLY HAPPEN... well.. when you actually want to delete stuff x)");
                        File.Delete(SharedData.currentDownloadLocation + "\\" + fileName);
                    }
                    catch (IOException ex)
                    {
                        Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ERROR:  We've got a problem :( -> " + ex.ToString());
                    }
                }
            }
            if (msg.Contains("OpenDirectory"))
            {
                Process.Start(SharedData.currentDownloadLocation);
            }
            if (msg.Contains("OpenFileDialog"))
            {
                try
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: opening file dialog.");
                    setDlDir();
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + ex.ToString());
                }

            }
            if (msg.Contains("PlayFile"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2].Trim();
                string fileLocation = Path.Combine(SharedData.currentDownloadLocation, fileName);
                try
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: Trying to open file: " + fileLocation);
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

            if (msg.Contains("GetCurrentDir"))
            {
               Send("CurrentDir^" + SharedData.currentDownloadLocation);
            }

            
            if (msg.Contains("CLOSE"))
            {
                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: CLOSING SHIT");
                SharedData.closeBackend = true;
            }
        }

        private void setDlDir()
        {
            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: TRYING TO OPEN FILE DIALOG");
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
                            SharedData.currentDownloadLocation = fbd.FileName;
                            SharedData.irc.setCustomDownloadDir(SharedData.currentDownloadLocation);
                           Send("CurrentDir^" + SharedData.currentDownloadLocation);
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
