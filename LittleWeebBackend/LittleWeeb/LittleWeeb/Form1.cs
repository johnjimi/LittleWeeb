using System;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using System.IO;
using System.Diagnostics;
using SimpleIRCLib;
using System.Collections.Concurrent;

namespace LittleWeeb
{
    public partial class Form1 : Form
    {
        public ChromiumWebBrowser chromeBrowser;
        private UsefullStuff usefullstuff;
        private SimpleWebSockets websocketserver;
        private WebSocketHandler webSocketHandler;
        private SimpleIRC irc;
        private IrcHandler irchandler;
        private SharedData shared;
        private SettingsHandler settings;
        private SimpleWebServer httpserver;
        public Form1()
        {
            usefullstuff = new UsefullStuff();

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
            chromeBrowser = new ChromiumWebBrowser("http://localhost:6010/index.html");


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
            websocketserver = new SimpleWebSockets(600);
            shared.websocketserver = websocketserver;
            webSocketHandler = new WebSocketHandler(shared, this);
           
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
            shared.irc = irc;
            irchandler = new IrcHandler(shared);
           
            Debug.WriteLine("IRCDEBUG: Succeeded in connecting to the IRC server!");
        }

        private void InitializeSharedData()
        {
            shared = new SharedData();
            shared.websocketserver = websocketserver;
            shared.irc = irc;
            shared.settings = settings;
            shared.joinedChannel = false;
            shared.closeBackend = false;
            shared.currentlyDownloading = false;
            shared.downloadList = new ConcurrentBag<dlData>();
            shared.currentDownloadId = "";
            shared.currentDownloadLocation = Application.StartupPath;
        }

        private void InitializeSettings()
        {
            settings = new SettingsHandler(shared);
            shared.settings = settings;
            settings.loadSettings();
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            shared.closeBackend = true;
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
                webSocketHandler.Shutdown();
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
