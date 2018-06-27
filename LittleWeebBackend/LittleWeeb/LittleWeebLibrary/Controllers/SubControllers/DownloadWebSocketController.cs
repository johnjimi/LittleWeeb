using System;
using System.Collections.Generic;
using System.Text;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.Settings;
using LittleWeebLibrary.Services;

namespace LittleWeebLibrary.Controllers
{
    public class DownloadWebSocketController : ISubWebSocketController, IDebugEvent
    {

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IDownloadWebSocketService DownloadWebSocketService;

        public DownloadWebSocketController(IDownloadWebSocketService downloadWebSocketService)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "DownloadWebSocketController called.",
                DebugSourceType = 0,
                DebugType = 0
            });

            DownloadWebSocketService = downloadWebSocketService;
        }

      
        public void OnWebSocketEvent(WebSocketEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "Method OnWebSocketEvent called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = args.ToString(),
                DebugSourceType = 1,
                DebugType = 1
            });
        }
    }
}
