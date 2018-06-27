using LittleWeebLibrary.Controllers;
using LittleWeebLibrary.GlobalInterfaces;
using System;

namespace LittleWeebLibrary
{
    public class LittleWeeb
    {

        public LittleWeeb()
        {
            ISubWebSocketController test = new IrcWebSocketController();
        }
    }
}
