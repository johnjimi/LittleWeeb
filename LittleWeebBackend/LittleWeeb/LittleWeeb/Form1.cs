using System;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using System.IO;
using System.Diagnostics;
using LittleWeebLibrary;

namespace LittleWeeb
{
    public partial class Form1 : Form
    {
        private readonly ChromiumWebBrowser chromeBrowser;
        public LittleWeebInit littleWeeb;
        public Form1()
        {


            InitializeComponent();
            //at the initialization , start chromium

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
                //log console
                chromeBrowser.ConsoleMessage += new EventHandler<ConsoleMessageEventArgs>(LogConsole);
                //add the browser to the form
                Controls.Add(chromeBrowser);
                //fill the form
                chromeBrowser.Dock = DockStyle.Fill;

                MyRequestHandler handler = new MyRequestHandler();
                chromeBrowser.RequestHandler = handler;
            }
            else
            {
                MessageBox.Show("When you use this application, you agree to the Terms of Use, which you can read on the About page. \r\n This application is still in development, so many issues can occur! \r\n Please report them here: https://github.com/EldinZenderink/LittleWeeb/issues");
                chromeBrowser = new ChromiumWebBrowser("http://localhost:6010/index.html")
                {
                    Dock = DockStyle.Fill,
                };


                Controls.Add(chromeBrowser);
                MyRequestHandler handler = new MyRequestHandler();
                chromeBrowser.RequestHandler = handler;
                chromeBrowser.ConsoleMessage += new EventHandler<ConsoleMessageEventArgs>(LogConsole);


            }



        }

        private void Form1_Load(object sender, EventArgs e)
        {

            this.littleWeeb = new LittleWeebInit(true);

        }

        private void LogConsole(object sender, ConsoleMessageEventArgs args)
        {
            Debug.WriteLine("CHROME-CONSOLE: " + args.Message);
        }


      
        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            Cef.Shutdown();
            Debug.WriteLine("MAIN-DEBUG: CLOSING THIS SHIT");
            this.littleWeeb.Shutdown();
            Application.Exit();

        }
    }
}
