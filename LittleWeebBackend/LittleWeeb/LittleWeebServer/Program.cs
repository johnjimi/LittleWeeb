using LittleWeebLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LittleWeebServer
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to LittleWeeb v0.4.0 Alpha :D");

            Console.WriteLine();
            Console.WriteLine("To use this application, you need to run the latest version of LittleWeebs interface by clicking on 'index.html' or by hosting it through a http server.");
            Console.WriteLine("When launching for the first time, you need to fill in the ip address of LittleWeebs server (where I am running). Then it should launch without issues!");
            Console.WriteLine("You can lateron change the ip if the ip address of the server changes, or if you relocate the server where it gets a new IP address.");
            Console.WriteLine();
            Console.WriteLine("============================= TERMS OF USAGE ====================================");
            Console.WriteLine("THIS IS A ALPHA VERSION OF LITTLEWEEB DUE TO A COMPLETE REWORK ON THE CODE BASE, EXPECT MANY ISSUES, PROBLEMS, BUGS, PERSONALITY ISSUES, ANGER ISSUES AND EVERTYHING ELSE RELATED TO THE USE OF THIS PROGRAM ");
            Console.WriteLine("WHEREFOR THE CREATOR AND PROGRAMMER OF THIS LOVELY LITTLE PROGRAM IS NOOOOT RESPONSIBLE FOR. HERE WE GO: By using this application you agree to the terms of usage basically saying that the creator, programmer and maintainer");
            Console.WriteLine("of LittleWeeb IS NOT responsible for anything that could possibly happenin the future when using this product. If you want to support the anime communicty GTFO of here and buy something anime related, otherwise, enjoy!");

            Console.WriteLine();

            Console.WriteLine("Press a key to start the server!");
            Console.ReadKey();

            LittleWeeb weeby = new LittleWeeb();

            Console.WriteLine("Press a key to stop the server!");
            Console.ReadKey();

            weeby.Stop();


            Console.WriteLine("Press a key to exit the server!");
            Console.ReadKey();            
        }
    }
}
