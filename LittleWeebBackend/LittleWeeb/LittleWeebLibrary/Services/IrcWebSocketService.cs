using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using LittleWeebLibrary.StaticClasses;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Services
{
    public interface IIrcWebSocketService
    {
        void Connect(string server, string channels, string username);
        void Disconnect();
        void EnableSendMessage();
        void DisableSendMessage();
        void SendMessage(string message);
    }
    public class IrcWebSocketService : IIrcWebSocketService, IDebugEvent
    {
        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IIrcClientHandler IrcClientHandler;

        private readonly LittleWeebSettings Settings;

        private bool SendMessageToWebSocketClient;
        private bool IsIrcConnected;

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        public IrcWebSocketService(LittleWeebSettings settings, IWebSocketHandler webSocketHandler, IIrcClientHandler ircClientHandler)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "IrcWebSocketService called.",
                DebugSourceType = 0,
                DebugType = 0
            });

            SendMessageToWebSocketClient = false;
            IsIrcConnected = false;
            Settings = settings;

            IrcClientHandler.OnIrcClientMessageEvent += OnIrcClientMessageEvent;
            IrcClientHandler.OnIrcClientConnectionStatusEvent += OnIrcClientConnectionStatusEvent;
        }


        public void Connect(string server, string channels, string username)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "Connect called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            try
            {
                if (username == "")
                {
                    username = UtilityMethods.GenerateUsername(Settings.RandomUsernameLength);
                }


                IrcSettings ircSettings = new IrcSettings()
                {
                    ServerAddress = server,
                    Channels = channels,
                    UserName = username
                };
                
                IrcClientHandler.StartConnection(ircSettings);

                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name,
                    DebugMessage = "Started irc connection using the following settings: " + ircSettings.ToString(),
                    DebugSourceType = 1,
                    DebugType = 2
                });

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

        public void EnableSendMessage()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "EnableSendMessage called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            SendMessageToWebSocketClient = true;
        }

        public void DisableSendMessage()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "DisableSendMessage called.",
                DebugSourceType = 1,
                DebugType = 0
            });
            
            SendMessageToWebSocketClient = false;
        }

        public void Disconnect()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "Disconnect called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            try
            {
                IrcClientHandler.StopConnection();
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

        public void SendMessage(string message)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "SendMessage called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = message,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                IrcClientHandler.SendMessage(message);
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

        private void OnIrcClientMessageEvent(object sender, IrcClientMessageEventArgs args)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = "OnIrcClientMessageEvent called.",
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

            try
            {
                if (SendMessageToWebSocketClient)
                {
                    JsonIrcChatMessage messageToSend = new JsonIrcChatMessage()
                    {
                        channel = args.Channel,
                        user = args.User,
                        message = args.Message
                    };

                    WebSocketHandler.SendMessage(messageToSend.ToJson());
                }
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                    DebugMessage = e.ToString(),
                    DebugSourceType = 1,
                    DebugType = 4
                });
            }
        }

        private void OnIrcClientConnectionStatusEvent(object sender, IrcClientConnectionStatusArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = "OnIrcClientConnectionStatusEvent called.",
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


            IsIrcConnected = args.Connected;

            try
            {
                JsonIrcInfo update = new JsonIrcInfo()
                {
                    connected = args.Connected,
                    channel = args.CurrentIrcSettings.Channels,
                    server = args.CurrentIrcSettings.ServerAddress,
                    user = args.CurrentIrcSettings.UserName,
                    downloadlocation = args.CurrentIrcSettings.DownloadDirectory
                };

                WebSocketHandler.SendMessage(update.ToJson());
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                    DebugMessage = e.ToString(),
                    DebugSourceType = 1,
                    DebugType = 4
                });
            }
        }

      

      
    }
}
