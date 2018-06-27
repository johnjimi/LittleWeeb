using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.EventArguments;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;
using LittleWeebLibrary.Services;

namespace LittleWeebLibrary.Controllers
{
    public class IrcWebSocketController : ISubWebSocketController, IDebugEvent
    {

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IIrcWebSocketService IrcWebSocketService;

        public IrcWebSocketController(IIrcWebSocketService ircWebSocketService)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "IrcWebSocketController called.",
                DebugSourceType = 0,
                DebugType = 0
            });

            IrcWebSocketService = ircWebSocketService;
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

                if (query.Value<string>("action") != null)
                {
                    string action = query.Value<string>("action");


                    switch (action)
                    {
                        case "connect_irc":
                            break;
                        case "disconnect_irc":
                            break;
                        case "enablechat_irc":
                            break;
                        case "disablechat_irc":
                            break;
                        case "sendmessage_irc":
                            break;
                        case "getuserlist_irc":
                            break;
                        default:
                            break;
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
            }    
        }
    }
}


