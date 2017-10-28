using System;
using SimpleIRCLib;
using System.Threading;
using System.Diagnostics;

namespace LittleWeeb
{
    class IrcHandler
    {
        private SharedData shared;
        private SimpleIRC irc;
        private SimpleWebSockets websocketserver;
        private UsefullStuff usefullstuff;

        private Thread downloaderLogicThread = null;
        private Thread makeSureConnection = null;
        public IrcHandler(SharedData shared)
        {
            

            this.shared = shared;
            websocketserver = shared.websocketserver;
            irc = shared.irc;

            usefullstuff = new UsefullStuff();

            websocketserver.SendGlobalMessage("IrcConnected-CurrentDir^" + shared.currentDownloadLocation);



            downloaderLogicThread = new Thread(new ThreadStart(downloaderLogic));
            downloaderLogicThread.Start();

            makeSureConnection = new Thread(new ThreadStart(startIrc));
            makeSureConnection.Start();

            Debug.WriteLine("DEBUG-IRCHANDLER: CONNECTED TO IRC SERVER");
        }

        public void Shutdown()
        {
            shared.closeBackend = true;
            shared.currentlyDownloading = false;
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
            int i = 0;
            while (!shared.joinedChannel)
            {
                try
                {
                    irc.stopXDCCDownload();
                    irc.stopClient();
                }
                catch (Exception e) { Debug.WriteLine("DEBUG-IRCHANDLER: ERROR: Could not shut down IRC client: " + e.ToString()); }
                string generatedUsername = usefullstuff.RandomString(6);
                irc.setupIrc("irc.rizon.net", 6667, generatedUsername,  "", "#nibl", chatOutputCallback);
                irc.setDebugCallback(debugOutputCallback);
                irc.setDownloadStatusChangeCallback(downloadStatusCallback);
                irc.setUserListReceivedCallback(userListReceivedCallback);
                irc.setCustomDownloadDir(shared.currentDownloadLocation);
                irc.startClient();

                int x = 4;
                while (x > 0)
                {
                    Thread.Sleep(1000);
                    x--;
                }

                if (!shared.joinedChannel)
                {
                    Debug.WriteLine("IRCDEBUG-IRCHANDLER: DID NOT JOIN CHANNEL, RETRY!");                   
                }
                i++;
                if(i > 1)
                {
                    Debug.WriteLine("IRCDEBUG-IRCHANDLER: I AM DONE TRYING TO CONNECT!");
                    break;
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
                shared.currentlyDownloading = true;
            }
            else if (status.ToString().Contains("FAILED") || status.ToString().Contains("COMPLETED") || status.ToString().Contains("ABORTED"))
            {
                shared.currentlyDownloading = false;
            }

            websocketserver.SendGlobalMessage("DOWNLOADUPDATE:" + shared.currentDownloadId + ":" + progress.ToString() + ":" + speedkbps.ToString() + ":" + status.ToString() + ":" + filename.ToString() + ":" + filesizeinmb.ToString());
        }

        private void userListReceivedCallback(string[] users) //see below for definition of each index in this array
        {
            shared.joinedChannel = true;
            Debug.WriteLine("IRCDEBUG-IRCHANDLER: GOT USER LIST, CONNECTION SHOULD BE SUCCESFUL");
        }

        private void downloaderLogic()
        {
            while (!shared.closeBackend)
            {
                if (!shared.currentlyDownloading)
                {
                    if (shared.downloadList.Count > 0)
                    {
                        Debug.WriteLine("DEBUG-IRCHANDLER: QUEU LENGTH BEFORE  TAKING: " + shared.downloadList.Count);
                        dlData data;
                        if(shared.downloadList.TryTake(out data))
                        {

                            shared.currentDownloadId = data.dlId;
                            bool succes = false;
                            try
                            {

                                succes = true;
                                irc.sendMessage("/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                                Thread.Sleep(1000);
                            }
                            catch
                            {
                                shared.currentlyDownloading = false;
                                Debug.WriteLine("DEBUG-IRCHANDLER: ERROR:  NOT CONNECTED TO IRC, CAN'T DOWNLOAD FILE :(");
                            }

                            if (succes)
                            {
                                shared.currentlyDownloading = true;
                                websocketserver.SendGlobalMessage("DOWNLOADSTARTED");
                                Debug.WriteLine("DEBUG-IRCHANDLER: Started a download: " + "/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                                Console.WriteLine("Started a download: " + "/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                            }
                        } else
                        {
                            Debug.WriteLine("DEBUG-IRCHANDLER: SOMETHING WENT WRONG WHILE TAKING FROM DOWLOADQUE :(");
                        }
                        Debug.WriteLine("DEBUG-IRCHANDLER: QUEU LENGTH AFTER TAKING: " + shared.downloadList.Count);
                    }
                }
                Thread.Sleep(50);
            }
        }
    }
}
