
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.IO;
using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text.RegularExpressions;
using SimpleIRCLib;
using SimpleWebSocketServer;
using Microsoft.WindowsAPICodePack.Dialogs;

namespace LittleWeebIRC
{
    class Program
    {

        public static SimpleIRC irc;
        public static List<dlData> downloadList;
        public static bool currentlyDownloading = false;
        public static string currentDownloadId = "";
        public static WebSocketServer server;
        public static string currentDownloadLocation = "";
        public static bool closeBackend = false;
        public static bool joinedChannel = false;

        static void Main(string[] args)
        {

            Console.WriteLine("Hello, welcome to LittleWeeb, this is backend version 0.0.7. You can hide this window. In the future, this window should dissapear and the program should just run in the background");

            string folder = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);            

            currentDownloadLocation = AppDomain.CurrentDomain.BaseDirectory;

            loadSettings();
            

            downloadList = new List<dlData>();

            server = new WebSocketServer(600);
            server.MessageReceived += new EventHandler<WebSocketEventArgs>(WsMessageReceived);
            server.DebugMessage += new EventHandler<WebSocketEventArgs>(WsDebugReceived);
            server.Start();
            server.SendGlobalMessage("HELLO LITTLE WEEB");

            HttpServer httpserver = new HttpServer(6010);
            httpserver.SetFileDir("GUI");
            httpserver.SetDefaultPage("index.html");
            httpserver.Start();
              
            string webgui =  @"GUI/index.html#socketip=" + GetLocalIPAddress();
            try
            {
                Process.Start("chrome.exe", " --app=\"http://localhost:6010/index.html\"");
            } catch
            {
                Process.Start(webgui);
                Debug.WriteLine("Could not start webgui :*(");
                Console.WriteLine("I am sorry, I couldn't locate chrome, please install chrome!");
            }


            string generatedUsername = RandomString(6);
            StartIRC("irc.rizon.net", 6667, generatedUsername, "#nibl");


            Thread dlListChecker = new Thread(new ThreadStart(downloaderLogic));
            dlListChecker.Start();

            //logging to tha file yo
            FileStream ostrm;
            StreamWriter writer;
            TextWriter oldOut = Console.Out;
            try
            {
                DateTime now = DateTime.Now;
                string date = GetValidFileName(now.ToString("s"));
                ostrm = new FileStream("awesomelogofc_" + date + ".txt", FileMode.OpenOrCreate, FileAccess.Write);
                TextWriterTraceListener myDebugListener = new TextWriterTraceListener(ostrm);
                Debug.Listeners.Add(myDebugListener);
            }
            catch (Exception e)
            {
                Debug.WriteLine("Cannot open Redirect.txt for writing");
                Debug.WriteLine(e.Message);
                return;
            }

            while (!closeBackend)  //irc output and such are handled in different threads
            {
                Thread.Sleep(100);
            }

            try
            {
                irc.stopXDCCDownload();
                irc.stopClient();
            }
            catch { }

            try
            {
                dlListChecker.Abort();
            }
            catch { }

            Debug.Flush();
            Debug.Close();
          
            Environment.Exit(0);
        }

        public static void WsMessageReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Debug.WriteLine(msg);
            if (msg.Contains("AreWeJoined"))
            {
                if (joinedChannel)
                {
                    server.SendGlobalMessage("IrcConnected");
                }
            }
            if (msg.Contains("GetAlreadyDownloadedFiles"))
            {
                string[] filePaths = Directory.GetFiles(currentDownloadLocation);
                string arrayToSend = "ALREADYDOWNLOADED";
                int a = 0;
                foreach(string filePath in filePaths)
                {
                    string filename = Path.GetFileName(filePath);
                    FileInfo info = new FileInfo(filePath);
                    int filesize = (int)(info.Length / 1048576); 

                    arrayToSend = arrayToSend + "," + a.ToString() + ":100:0:COMPLETED:" + filename + ":" + filesize.ToString();

                    a++;
                }

                server.SendGlobalMessage(arrayToSend);

            }
            if (msg.Contains("AddToDownloads"))
            {
                Debug.WriteLine("DOWNLOAD REQUEST:" + msg);
                if (msg.Contains(","))
                {
                    string[] bulkDownloads = msg.Split(',');
                    foreach(string download in bulkDownloads)
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
                            downloadList.Add(d);
                        }
                        catch
                        {

                        }

                    }
                } else
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
                    downloadList.Add(d);
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
                    Debug.WriteLine("tried to stop download but there isn't anything downloading or no connection to irc");
                }
            }
            if (msg.Contains("DeleteDownload"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2];
                if (currentDownloadId == dlId)
                {
                    try
                    {
                        Debug.WriteLine("I guess I should Delete stuff");
                        irc.stopXDCCDownload();
                    }
                    catch
                    {
                        Debug.WriteLine("tried to stop download but there isn't anything downloading or no connection to irc");
                    }
                }
                else
                {
                    int index = 0;
                    foreach (dlData data in downloadList)
                    {
                        if (data.dlId == dlId)
                        {
                            downloadList.Remove(data);
                            break;
                        }
                        index++;
                    }

                    try
                    {
                        Debug.WriteLine("DEBUG: YOU MORON... no actually, THIS SHOULD ONLY HAPPEN... well.. when you actually want to delete stuff x)");
                        File.Delete(currentDownloadLocation + "\\" + fileName); 
                    } catch (IOException e)
                    {
                        Debug.WriteLine("DEBUG: We've got a problem :( -> " + e.ToString());
                    }
                }
            }
            if (msg.Contains("OpenDirectory"))
            {

                Process.Start(currentDownloadLocation);
            }
            if (msg.Contains("OpenFileDialog"))
            {
                try
                {
                    Debug.WriteLine("OPENING FILE D DIALOG");
                    Thread openfdwithoutblocking = new Thread(new ThreadStart(delegate
                    {

                        Thread openfd = new Thread(new ThreadStart(setDlDir));
                        openfd.TrySetApartmentState(ApartmentState.STA);
                        openfd.Start();
                        openfd.Join();
                    }));
                    openfdwithoutblocking.Start();
                }
                catch (Exception e)
                {
                    Debug.WriteLine("DEBUG: " + e.ToString());
                }
               
            }
            if (msg.Contains("PlayFile"))
            {
                string dlId = msg.Split(':')[1];
                string fileName = msg.Split(':')[2].Trim();
                string fileLocation = Path.Combine(currentDownloadLocation, fileName); 
                try
                {
                    Debug.WriteLine("DEBUG: Trying to open file: " + fileLocation);
                    Thread player = new Thread(new ThreadStart(delegate
                    {
                        Process.Start(fileLocation);
                    }));
                    player.Start();
                }
                catch(Exception e)
                {
                    Debug.WriteLine("DEBUG: We've got another problem: " + e.ToString());
                }
            }

            if (msg.Contains("GetCurrentDir"))
            {
                server.SendGlobalMessage("CurrentDir^" + currentDownloadLocation);
            }

            if (msg.Contains("CORS"))
            {
                string url = msg.Split('^')[1];
                WebClient client = new WebClient();
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;
                ServicePointManager.ServerCertificateValidationCallback += (send, cert, chain, sslPolicyErrors) => true;

                
                string response = client.DownloadString(url);
                Debug.WriteLine(response);
                server.SendGlobalMessage("CORSRESPONSE: " + response);
            }

            if (msg.Contains("CLOSE"))
            {
                Debug.WriteLine("DEBUG: CLOSING SHIT");
                closeBackend = true;
            }
        }

        public static void WsDebugReceived(object sender, WebSocketEventArgs args)
        {
            string msg = args.Message;
            Debug.WriteLine("WSDEBUG: " + msg);
        }
        
        public static void setDlDir()
        {
            Debug.WriteLine("DEBUG: TRYING TO OPEN FILE DIALOG");
            try
            {
                using (var fbd = new CommonOpenFileDialog())
                {
                    fbd.InitialDirectory = "C:\\Users";
                    fbd.IsFolderPicker = true;

                    if (fbd.ShowDialog() == CommonFileDialogResult.Ok && !string.IsNullOrWhiteSpace(fbd.FileName))
                    {
                        currentDownloadLocation = fbd.FileName;
                        irc.setCustomDownloadDir(currentDownloadLocation);
                        server.SendGlobalMessage("CurrentDir^" + currentDownloadLocation);
                        saveSettings();
                    }

                }
            } catch(Exception e)
            {
                Debug.WriteLine("DEBUG: " + e.ToString());
            }
           
        }

        public static void downloaderLogic()
        {
            while (!closeBackend)
            {
                if (!currentlyDownloading)
                {
                    if(downloadList.Count > 0)
                    {
                        dlData data = downloadList[0];
                        currentDownloadId = data.dlId;
                        bool succes = false;
                        try
                        {
                           
                            succes = true;
                            irc.sendMessage("/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                            Thread.Sleep(1000);
                        }
                        catch
                        {
                            currentlyDownloading = false;
                            Debug.WriteLine("DEBUG: NOT CONNECTED TO IRC, CAN'T DOWNLOAD FILE :(");
                        }

                        if (succes)
                        {
                            currentlyDownloading = true;
                            downloadList.Remove(data);
                            server.SendGlobalMessage("DOWNLOADSTARTED");
                            Debug.WriteLine("DEBUG: Started a download: " + "/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                            Console.WriteLine("Started a download: " + "/msg " + data.dlBot + " xdcc send #" + data.dlPack);
                        }
                    }
                }
                Thread.Sleep(500);
            }
        }


        public static void StartIRC(string ip, int port, string username, string channel)
        {
            try
            {
                if (irc.isClientRunning())
                {
                    irc.stopClient();
                }
            } catch
            {

            }
            irc = new SimpleIRC();
            irc.setupIrc(ip, port, username, "", channel, chatOutputCallback);
            irc.setDebugCallback(debugOutputCallback);
            irc.setDownloadStatusChangeCallback(downloadStatusCallback);
            irc.setUserListReceivedCallback(userListReceivedCallback);
            irc.setCustomDownloadDir(currentDownloadLocation);
            irc.startClient();

            int x = 3;
            while (x > 0)
            {
                Thread.Sleep(1000);
                x--;
            }

            if (!joinedChannel)
            {
                Debug.WriteLine("DEBUG: DID NOT JOIN CHANNEL, RETRY!");
                StartIRC(ip, port, username, channel);
            }

            server.SendGlobalMessage("IrcConnected-CurrentDir^" + currentDownloadLocation);

            Debug.WriteLine("DEBUG: CONNECTED TO IRC SERVER");
            Console.WriteLine("Succeeded in connecting to the IRC server!");

            // irc.sendMessage("/join #nibl");
        }

        public static void chatOutputCallback(string user, string message)
        {
            Debug.WriteLine(user + ":" + message);
        }

        public static void debugOutputCallback(string debug)
        {
            Debug.WriteLine("IRCDEBUG: " + debug);

        }

        public static void downloadStatusCallback() //see below for definition of each index in this array
        {
            Object progress = irc.getDownloadProgress("progress");
            Object speedkbps = irc.getDownloadProgress("kbps");
            Object status = irc.getDownloadProgress("status");
            Object filename = irc.getDownloadProgress("filename");
            Object filesize = irc.getDownloadProgress("size");
            int filesizeinmb = (int.Parse(filesize.ToString().Trim()) / 1048576);
            if (status.ToString().Contains("DOWNLOADING") && status.ToString().Contains("WAITING"))
            {
                currentlyDownloading = true;
            }
            else if (status.ToString().Contains("FAILED") || status.ToString().Contains("COMPLETED") || status.ToString().Contains("ABORTED"))
            {
                currentlyDownloading = false;
            }

            server.SendGlobalMessage("DOWNLOADUPDATE:" + currentDownloadId + ":" + progress.ToString() + ":" + speedkbps.ToString() + ":" + status.ToString() + ":" + filename.ToString() + ":" + filesizeinmb.ToString());
        }

        public static void userListReceivedCallback(string[] users) //see below for definition of each index in this array
        {
            joinedChannel = true;
            Debug.WriteLine("IRCDEBUG: GOT USER LIST, CONNECTION SHOULD BE SUCCESFUL");
        }

        public static void saveSettings()
        {
            try
            {
                Settings setting = new Settings();
                setting.downloaddir = currentDownloadLocation;
                IFormatter formatter = new BinaryFormatter();
                string settingsFile = "LittleWeebSettings.bin";
                Stream stream = new FileStream(settingsFile, FileMode.Create, FileAccess.Write, FileShare.None);
                formatter.Serialize(stream, setting);
                stream.Close();
            }
            catch (Exception e)
            {
                Debug.WriteLine("DEBUG: COULD NOT SAVE SETTINGS -> " + e.ToString());
            }
            
        }

        public static void loadSettings()
        {
            try
            {
                IFormatter formatter = new BinaryFormatter();

                string settingsFile = "LittleWeebSettings.bin";
                if (!File.Exists(settingsFile))
                {
                    File.Create(settingsFile);
                } else
                {

                    Stream stream = new FileStream(settingsFile, FileMode.Open, FileAccess.Read, FileShare.Read);
                    Settings setting = (Settings)formatter.Deserialize(stream);
                    stream.Close();
                    currentDownloadLocation = setting.downloaddir;
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine("DEBUG: COULD NOT OPEN SETTINGS -> " + e.ToString());
            }

        }

        private static string GetValidFileName(string fileName)
        {
            // remove any invalid character from the filename.
            String ret = Regex.Replace(fileName.Trim(), "[^A-Za-z0-9_. ]+", "");
            return ret.Replace(" ", String.Empty);
        }


        private static Random random = new Random();
        public static string RandomString(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("Local IP Address Not Found!");
        }



    }
}
