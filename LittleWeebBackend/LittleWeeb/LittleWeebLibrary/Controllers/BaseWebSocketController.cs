using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using LittleWeebLibrary.Handlers;

namespace LittleWeebLibrary.Controllers
{

    public class BaseWebSocketController : IDebugEvent
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;
        private readonly IWebSocketHandler WebSocketHandler;
        private readonly List<ISubWebSocketController> SubControllers;

        public BaseWebSocketController(LittleWeebSettings settings, List<ISubWebSocketController> subControllers, IWebSocketHandler webSocketHandler)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "Constructor Called",
                DebugSourceType = 0,
                DebugType = 0
            });



            SubControllers = subControllers;

            WebSocketHandler = webSocketHandler;
            WebSocketHandler.OnWebSocketEvent += OnWebSocketEvent;


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
