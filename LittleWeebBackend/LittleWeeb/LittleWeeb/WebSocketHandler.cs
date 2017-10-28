using System;
using System.Diagnostics;
using SimpleIRCLib;
using System.IO;
using System.Threading;
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
            Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: " + msg);
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
                            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ADDING TO DOWLOADS: ID:" + dlId + " XDCC: /msg " + dlBot + " xdcc send #" + dlPack);
                            dlData d = new dlData();
                            d.dlId = dlId;
                            d.dlBot = dlBot;
                            d.dlPack = dlPack;
                            shared.downloadList.Add(d);
                            dlData added = new dlData();
                            if( shared.downloadList.TryPeek(out added))
                            {
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ADDED TO DOWLOADS: ID:" + added.dlId + " XDCC: /msg " + added.dlBot + " xdcc send #" + added.dlPack);
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: SIZE OF QUEU:" + shared.downloadList.Count);
                            } else
                            {
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: I COULDN'T PEEK AFTER ADDING, SOMETHING MIGHT HAVE GONE WRONG :(");
                                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: SIZE OF QUEU:" + shared.downloadList.Count);
                            }
                        }
                        catch(Exception e)
                        {
                            Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + e.ToString());
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
                    shared.irc.stopXDCCDownload();
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
                if (shared.currentDownloadId == dlId)
                {
                    try
                    {
                        Debug.WriteLine("I guess I should Delete stuff");
                        shared.irc.stopXDCCDownload();
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
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: QUEU LENGTH BEFORE REMOVING: " + shared.downloadList.Count);
                    for (index = 0; index < shared.downloadList.Count; index++)
                    {
                        dlData toadd = new dlData();
                        if(shared.downloadList.TryTake(out toadd))
                        {
                            if(toadd.dlId != dlId)
                            {
                                shared.downloadList.Add(toadd);
                            } else
                            {
                                removedItems++;
                            }
                        }
                    }
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: QUEU LENGTH AFTER REMOVING: " + shared.downloadList.Count);
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
                        File.Delete(shared.currentDownloadLocation + "\\" + fileName);
                    }
                    catch (IOException e)
                    {
                        Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: ERROR:  We've got a problem :( -> " + e.ToString());
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
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: opening file dialog.");
                    setDlDir();
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: " + e.ToString());
                }

            }
            if (msg.Contains("PlayFile"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2].Trim();
                string fileLocation = Path.Combine(shared.currentDownloadLocation, fileName);
                try
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: Trying to open file: " + fileLocation);
                    Thread player = new Thread(new ThreadStart(delegate
                    {
                        Process.Start(fileLocation);
                    }));
                    player.Start();
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG-WEBSOCKETHANDLER:ERROR: We've got another problem: " + e.ToString());
                }
            }

            if (msg.Contains("GetCurrentDir"))
            {
                websocketserver.SendGlobalMessage("CurrentDir^" + shared.currentDownloadLocation);
            }

            
            if (msg.Contains("CLOSE"))
            {
                Debug.WriteLine("DEBUG-WEBSOCKETHANDLER: CLOSING SHIT");
                shared.closeBackend = true;
            }
        }

        private void WsDebugReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Debug.WriteLine("WSDEBUG-WEBSOCKETHANDLER: " + msg);
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
                            shared.currentDownloadLocation = fbd.FileName;
                            shared.irc.setCustomDownloadDir(shared.currentDownloadLocation);
                            websocketserver.SendGlobalMessage("CurrentDir^" + shared.currentDownloadLocation);
                            shared.settings.saveSettings();
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
