using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Services;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Controllers
{
    public class FileWebSocketController : ISubWebSocketController, IDebugEvent
    {

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IFileWebSocketService FileWebSocketService;

        public FileWebSocketController(IFileWebSocketService fileWebSocketService)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "FileWebSocketController called.",
                DebugSourceType = 0,
                DebugType = 0
            });

            FileWebSocketService = fileWebSocketService;
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
