using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Controllers
{

    public class BaseWebSocketController : IDebugEvent
    {
        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IIrcClientHandler IrcClientHandler;
        private readonly IDownloadHandler DownloadHandler;
        private readonly List<ISubWebSocketController> SubControllers;
        private readonly LittleWeebSettings Settings;
        
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        public BaseWebSocketController(LittleWeebSettings settings, List<ISubWebSocketController> subControllers, IWebSocketHandler webSocketHandler, IIrcClientHandler ircClientHandler, IDownloadHandler downloadHandler)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "Constructor Called",
                DebugSourceType = 0,
                DebugType = 0
            });


            WebSocketHandler = webSocketHandler;
            Settings = settings;

            SubControllers = subControllers;


            WebSocketHandler.OnWebSocketEvent += OnWebSocketEvent;

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "Constructor Call Finished",
                DebugSourceType = 0,
                DebugType = 0
            });


        }      

        private void OnWebSocketEvent(object sender, WebSocketEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = "Event OnWebSocketEvent called.",
                DebugSourceType = 2,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = args.ToString(),
                DebugSourceType = 2,
                DebugType = 1
            });

            try{
                foreach (ISubWebSocketController controller in SubControllers)
                {
                    controller.OnWebSocketEvent(args);
                }
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                    DebugMessage = e.ToString(),
                    DebugSourceType = 2,
                    DebugType = 4
                });
            }
        }
    }
}
