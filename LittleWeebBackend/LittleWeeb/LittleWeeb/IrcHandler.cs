using System;
using SimpleIRCLib;
using System.Threading;
using System.Diagnostics;
using WebSocketSharp.Server;

namespace LittleWeeb
{
    class IrcHandler : WebSocketBehavior
    {
        private SimpleIRC irc;
        private WebSocketServer websocketserver;
        private UsefullStuff usefullstuff;

        private Thread downloaderLogicThread = null;
        private Thread makeSureConnection = null;
        public IrcHandler()
        {
            

            websocketserver = SharedData.websocketserver;
            irc = SharedData.irc;

            usefullstuff = new UsefullStuff();

            SharedData.messageToSendWS.Add("IrcConnected-CurrentDir^" + SharedData.currentDownloadLocation);

            downloaderLogicThread = new Thread(new ThreadStart(downloaderLogic));
            downloaderLogicThread.Start();

            makeSureConnection = new Thread(new ThreadStart(startIrc));
            makeSureConnection.Start();

        }

        public void Shutdown()
        {
            SharedData.closeBackend = true;
            SharedData.currentlyDownloading = false;
            downloaderLogicThread.Abort();

            try
            {
                irc.stopXDCCDownload();
                irc.stopClient();
            }
            catch (Exception e){ Debug.WriteLine("DEBUG-IRCHANDLER: ERROR: Could not shut down IRC client: " + e.ToString()); }
        }

        private void startIrc()
        {
            Debug.WriteLine("IRCDEBUG-IRCHANDLER: STARTING CONNECTION TO IRC SERVER!");
            int i = 0;
            while (!SharedData.joinedChannel)
            {
                try
                {
                    irc.stopXDCCDownload();
                    irc.stopClient();
                }
                catch (Exception e) { Debug.WriteLine("DEBUG-IRCHANDLER: ERROR: Could not shut down IRC client: " + e.ToString()); }
                string generatedUsername = "LittleWeeb_" + usefullstuff.RandomString(6);
                irc.setupIrc("irc.rizon.net", 6667, generatedUsername,  "", "#nibl", chatOutputCallback);
                irc.setDebugCallback(debugOutputCallback);
                irc.setDownloadStatusChangeCallback(downloadStatusCallback);
                irc.setUserListReceivedCallback(userListReceivedCallback);
                irc.setCustomDownloadDir(SharedData.currentDownloadLocation);
                irc.startClient();

                int x = 4;
                while (x > 0)
                {
                    Thread.Sleep(1000);
                    x--;
                }

                if (!SharedData.joinedChannel)
                {
                    Debug.WriteLine("IRCDEBUG-IRCHANDLER: DID NOT JOIN CHANNEL, RETRY!");                   
                }
                i++;
                if(i > 3)
                {
                    Debug.WriteLine("IRCDEBUG-IRCHANDLER: I AM DONE TRYING TO CONNECT!");
                    break;
                } else
                {

                    Debug.WriteLine("DEBUG-IRCHANDLER: NOT CONNECTED TO IRC SERVER");
                }
            }
          
        }

        private void chatOutputCallback(string user, string message)
        {
            Debug.WriteLine(user + ":" + message);
        }

        private void debugOutputCallback(string debug)
        {
            Debug.WriteLine("IRCDEBUG - DEBUG-IRCHANDLER: " + debug);

        }

        private void downloadStatusCallback() //see below for definition of each index in this array
        {
            Object progress = irc.getDownloadProgress("progress");
            Object speedkbps = irc.getDownloadProgress("kbps");
            Object status = irc.getDownloadProgress("status");
            Object filename = irc.getDownloadProgress("filename");
            Object filesize = irc.getDownloadProgress("size");
            long filesizeinmb = (long.Parse(filesize.ToString().Trim()) / 1048576);
            if (status.ToString().Contains("DOWNLOADING") && status.ToString().Contains("WAITING"))
            {
                SharedData.currentlyDownloading = true;
            }
            else if (status.ToString().Contains("FAILED") || status.ToString().Contains("COMPLETED") || status.ToString().Contains("ABORTED"))
            {
                SharedData.currentlyDownloading = false;
            }

            SharedData.messageToSendWS.Add("DOWNLOADUPDATE:" + SharedData.currentDownloadId + ":" + progress.ToString() + ":" + speedkbps.ToString() + ":" + status.ToString() + ":" + filename.ToString() + ":" + filesizeinmb.ToString());
        }

        private void userListReceivedCallback(string[] users) //see below for definition of each index in this array
        {
            SharedData.joinedChannel = true;
            Debug.WriteLine("IRCDEBUG-IRCHANDLER: GOT USER LIST, CONNECTION SHOULD BE SUCCESFUL");
        }

        private void downloaderLogic()
        {
            while (!SharedData.closeBackend)
            {
                if (!SharedData.currentlyDownloading)
                {
                    if (SharedData.downloadList.Count > 0)
                    {
                        Debug.WriteLine("DEBUG-IRCHANDLER: QUEU LENGTH BEFORE  TAKING: " + SharedData.downloadList.Count);
                        dlData data;
                        if(SharedData.downloadList.TryTake(out data))
                        {

                            SharedData.currentDownloadId = data.dlId;
                            bool succes = false;
                            try
                            {

                                succes = true;
                                irc.sendMessage("/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                                Thread.Sleep(1000);
                            }
                            catch
                            {
                                SharedData.currentlyDownloading = false;
                                Debug.WriteLine("DEBUG-IRCHANDLER: ERROR:  NOT CONNECTED TO IRC, CAN'T DOWNLOAD FILE :(");
                            }

                            if (succes)
                            {
                                SharedData.currentlyDownloading = true;
                                SharedData.messageToSendWS.Add("DOWNLOADSTARTED");
                                Debug.WriteLine("DEBUG-IRCHANDLER: Started a download: " + "/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                                Console.WriteLine("Started a download: " + "/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                            }
                        } else
                        {
                            Debug.WriteLine("DEBUG-IRCHANDLER: SOMETHING WENT WRONG WHILE TAKING FROM DOWLOADQUE :(");
                        }
                        Debug.WriteLine("DEBUG-IRCHANDLER: QUEU LENGTH AFTER TAKING: " + SharedData.downloadList.Count);
                    }
                }
                Thread.Sleep(50);
            }
        }
    }
}
