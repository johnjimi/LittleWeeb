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
            startUp = new StartUp();
            startUp.Start();
        }

        public void Stop()
        {
            startUp.Stop();
        }
    }
}
