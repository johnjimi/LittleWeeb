using System;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using System.IO;
using System.Diagnostics;
using SimpleIRCLib;
using WebSocketSharp.Server;
using System.Collections.Generic;
using LittleWeebLibrary;

namespace LittleWeeb
{
    public partial class Form1 : Form
    {
        public ChromiumWebBrowser chromeBrowser;
        public static Form1 form;

        public LittleWeebInit littleWeeb;
        public Form1()
        {

            form = this;

            InitializeComponent();
            //at the initialization , start chromium
            InitializeChromium();


        }

        private void Form1_Load(object sender, EventArgs e)
        {

            this.littleWeeb = new LittleWeebInit();

        }

        private void InitializeChromium()
        {
            Cef.EnableHighDPISupport();
            CefSettings settings = new CefSettings();
            //initialize cef with the provided settings
            Cef.Initialize(settings);
            //initialize index html
            String index = string.Format(@"GUI/index.html", Application.StartupPath);
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


      
        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {

            this.littleWeeb.Shutdown();
            Cef.Shutdown();
            Environment.Exit(0);

        }
    }
}
