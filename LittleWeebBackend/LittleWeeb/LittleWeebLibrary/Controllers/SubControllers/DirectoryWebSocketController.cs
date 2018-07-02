using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Services;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Controllers.SubControllers
{
    public class DirectoryWebSocketController : ISubWebSocketController, IDebugEvent
    {

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IDirectoryWebSocketService DirectoryWebSocketService;

        public DirectoryWebSocketController(IWebSocketHandler webSocketHandler, IDirectoryWebSocketService directoryWebSocketService)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "DirectoryWebSocketController called.",
                DebugSourceType = 0,
                DebugType = 0
            });

            DirectoryWebSocketService = directoryWebSocketService;
            WebSocketHandler = webSocketHandler;
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


            try
            {
                JObject query = JObject.Parse(args.Message);
                string action = query.Value<string>("action");

                if (action != null)
                {
                    JObject extra = query.Value<JObject>("extra");

                    if (extra != null)
                    {
                        switch (action)
                        {
                            case "create_directory":
                                DirectoryWebSocketService.CreateDirectory(extra);
                                break;
                            case "delete_directory":
                                DirectoryWebSocketService.DeleteDirectory(extra);
                                break;
                            case "get_directories":
                                DirectoryWebSocketService.GetDirectories(extra);
                                break;
                            default:
                                JsonError error = new JsonError()
                                {
                                    type = "command_error",
                                    errormessage = "Server could not understand command (With extra specified).",
                                    errortype = "warning"
                                };
                                WebSocketHandler.SendMessage(error.ToJson());
                                break;
                        }
                    }
                    else
                    {
                        switch (action)
                        {
                            case "get_directories":
                                DirectoryWebSocketService.GetDrives();
                                break;
                            default:
                                JsonError error = new JsonError()
                                {
                                    type = "command_error",
                                    errormessage = "Server could not understand command (without extra specified).",
                                    errortype = "warning"
                                };
                                WebSocketHandler.SendMessage(error.ToJson());
                                break;
                        }
                    }
                }
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name,
                    DebugMessage = e.ToString(),
                    DebugSourceType = 1,
                    DebugType = 4
                });

                JsonError error = new JsonError()
                {
                    type = "command_error",
                    errormessage = "Error happend during execution of command.",
                    errortype = "exception"
                };
                WebSocketHandler.SendMessage(error.ToJson());
            }
        }
    }
}
