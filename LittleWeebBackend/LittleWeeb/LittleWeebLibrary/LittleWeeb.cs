using LittleWeebLibrary.Controllers;
using LittleWeebLibrary.GlobalInterfaces;
using System;

namespace LittleWeebLibrary
{
    public class LittleWeeb
    {
        private readonly StartUp startUp;
        public LittleWeeb()
        {
            Console.WriteLine("IM DESPERATE, STARTIN STARTUP!");
            startUp = new StartUp();
            startUp.Start();
        }

        public void Stop()
        {
            startUp.Stop();
        }
    }
}
