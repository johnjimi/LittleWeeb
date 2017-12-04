using System;
using System.Net;
using System.Net.Sockets;
using LittleWeebLibrary;
using System.Reflection;
using System.IO;

namespace LittleWeebServer
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to littleweeb's server!");
            Console.WriteLine("=================================");

            String index = string.Format(@"GUI/index.html", Assembly.GetEntryAssembly().CodeBase);
            if (!File.Exists(index))
            {
                Console.WriteLine("Could not locate interface :(, go to https://github.com/EldinZenderink/LittleWeeb/issues and report an issue there, please include the log file, which can be found in the directory where littleweeb resides!");
            } else
            {
                try
                {
                    Console.WriteLine("You can load the interface on your device which should be connected to the same network as where this server is running, using the following address:");
                    string ip = GetLocalIPAddress();
                    if (Assembly.GetEntryAssembly().CodeBase.Contains("Debug"))
                    {
                        Console.WriteLine("Startup Directory Path contains Debug - > " + Assembly.GetEntryAssembly().CodeBase + " \r\n, This means you are probably a developer, so the interface url has been set to localhost:4200 (nodejs). If you see this and you are NOT a developer of LittleWeeb, please put the files in a directory that doesn't contain Debug in it's path!");
                        Console.WriteLine("http://" + ip  + ":4200");
                    }
                    else
                    {
                        Console.WriteLine("When you use this application, you agree to the Terms of Use, which you can read on the About page. \r\n This application is still in development, so many issues can occur! \r\n Please report them here: https://github.com/EldinZenderink/LittleWeeb/issues");
                        Console.WriteLine("http://" + ip + ":6010");
                    }

                    Console.WriteLine("Thanks for using LittleWeeb, if issues occur, please notify the developer here:");
                    Console.WriteLine("https://github.com/EldinZenderink/LittleWeeb/issues");

                    LittleWeebInit init = new LittleWeebInit(false);

                    Console.WriteLine("Press a key to exit!");
                    Console.ReadLine();

                    init.Shutdown();
                } catch (Exception e)
                {
                    Console.WriteLine(e.ToString());
                    Console.WriteLine("Could not start LittleWeeb!");
                    Console.WriteLine("Press a key to exit!");
                    Console.ReadLine();
                }
               
            } 


            

        }

        private static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }
    }
}
