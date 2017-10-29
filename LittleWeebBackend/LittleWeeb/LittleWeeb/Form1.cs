using System;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using System.IO;
using System.Diagnostics;
using SimpleIRCLib;
using System.Collections.Concurrent;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace LittleWeeb
{
    public partial class Form1 : Form
    {
        public ChromiumWebBrowser chromeBrowser;
        private UsefullStuff usefullstuff;
        private WebSocketServer websocketserver;
        private SimpleIRC irc;
        private IrcHandler irchandler;
        private SettingsHandler settings;
        private SimpleWebServer httpserver;
        public static Form1 form;
        public Form1()
        {
            usefullstuff = new UsefullStuff();

            form = this;

            InitializeComponent();
            //initialize sharing between classes
            InitializeSharedData();
            //initialize settings and load them
            InitializeSettings();
            //initialize debugging
            InitializeDebugging();
            //initialize websockets
            InitializeWebSocketSever();
            //initialize webserver
            InitializeWebServer();
            //at the initialization , start chromium
            InitializeChromium();


        }

        private void Form1_Load(object sender, EventArgs e)
        {

            //intialize irc
            InitializeSimpleIRC();

        }

        private void InitializeChromium()
        {
            CefSettings settings = new CefSettings();
            //initialize cef with the provided settings
            Cef.Initialize(settings);
            //initialize index html
            String index = string.Format(@"GUI\index.html", Application.StartupPath);
            if (!File.Exists(index))
            {
                MessageBox.Show("Could not locate interface :(, go to https://github.com/EldinZenderink/LittleWeeb/issues and report an issue there, please include the log file, which can be found in the directory where littleweeb resides!");
            }
            //create browser component
            if (Application.StartupPath.Contains("Debug"))
            {
                MessageBox.Show("Startup Directory Path contains Debug - > " + Application.StartupPath + " \r\n, This means you are probably a developer, so the interface url has been set to localhost:4200 (nodejs). If you see this and you are NOT a developer of LittleWeeb, please put the files in a directory that doesn't contain Debug in it's path!");
                chromeBrowser = new ChromiumWebBrowser("http://localhost:4200");
            } else
            {
                MessageBox.Show("When you use this application, you agree to the Terms of Use, which you can read on the About page. \r\n This application is still in development, so many issues can occur! \r\n Please report them here: https://github.com/EldinZenderink/LittleWeeb/issues");
                chromeBrowser = new ChromiumWebBrowser("http://localhost:6010/index.html");
            }


            //log console
            chromeBrowser.ConsoleMessage += new EventHandler<ConsoleMessageEventArgs>(LogConsole);
            //add the browser to the form
            Controls.Add(chromeBrowser);
            //fill the form
            chromeBrowser.Dock = DockStyle.Fill;

            MyRequestHandler handler = new MyRequestHandler();
            chromeBrowser.RequestHandler = handler;
        }

        private void LogConsole(object sender, ConsoleMessageEventArgs args)
        {
            Debug.WriteLine("CHROME-CONSOLE: " + args.Message);
        }


        private void InitializeWebServer()
        {
            httpserver = new SimpleWebServer(6010);
            httpserver.SetFileDir("GUI");
            httpserver.SetDefaultPage("index.html");
            httpserver.Start();
        }


        private void InitializeDebugging()
        {
            FileStream ostrm;
            TextWriter oldOut = Console.Out;
            try
            {
                DateTime now = DateTime.Now;
                string date = usefullstuff.GetValidFileName(now.ToString("s"));
                ostrm = new FileStream("awesomelogofc_" + date + ".txt", FileMode.OpenOrCreate, FileAccess.Write);
                TextWriterTraceListener myDebugListener = new TextWriterTraceListener(ostrm);
                Debug.Listeners.Add(myDebugListener);
            }
            catch (Exception e)
            {
                Debug.WriteLine("DEBUG-MAIN: Cannot open Redirect.txt for writing");
                Debug.WriteLine(e.Message);
                return;
            }
        }

        private void InitializeWebSocketSever()
        {
            websocketserver = new WebSocketServer(600);
            websocketserver.AddWebSocketService<WebSocketHandler>("/");
            websocketserver.Start();
           
        }

        private void InitializeSimpleIRC()
        {
            try
            {
                if (irc.isClientRunning())
                {
                    irc.stopClient();
                }
            }
            catch
            {

            }
            irc = new SimpleIRC();
            SharedData.irc = irc;
            irchandler = new IrcHandler();
        }

        private void InitializeSharedData()
        {
            SharedData.websocketserver = websocketserver;
            SharedData.irc = irc;
            SharedData.settings = settings;
            SharedData.joinedChannel = false;
            SharedData.closeBackend = false;
            SharedData.currentlyDownloading = false;
            SharedData.downloadList = new ConcurrentBag<dlData>();
            SharedData.currentDownloadId = "";
            SharedData.currentDownloadLocation = Application.StartupPath;
            SharedData.messageToSendWS = new ConcurrentBag<string>();
        }

        private void InitializeSettings()
        {
            settings = new SettingsHandler();
            SharedData.settings = settings;
            settings.loadSettings();
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            SharedData.closeBackend = true;
            httpserver.StopServer();
            try
            {
                irchandler.Shutdown();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("DEBUG-MAIN:  Could not close irc :( ");
                Debug.WriteLine(ex.ToString());
            }
            try
            {
                websocketserver.Stop();
            }
            catch (Exception ex)
            {
                Debug.WriteLine("DEBUG-MAIN:  Could not close websocketserver :( ");
                Debug.WriteLine(ex.ToString());
            }

            Debug.Flush();
            Debug.Close();

            Cef.Shutdown();
            Environment.Exit(0);



        }

    }
}
