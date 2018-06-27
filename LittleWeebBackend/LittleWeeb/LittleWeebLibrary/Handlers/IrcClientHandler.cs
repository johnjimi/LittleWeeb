using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Text;

using SimpleIRCLib;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using System.IO;

namespace LittleWeebLibrary.Handlers
{

    public interface IIrcClientHandler
    {
        event EventHandler<IrcClientMessageEventArgs> OnIrcClientMessageEvent;
        event EventHandler<IrcClientDownloadEventArgs> OnIrcClientDownloadEvent;
        event EventHandler<IrcClientConnectionStatusArgs> OnIrcClientConnectionStatusEvent;
        void SendMessage(string message);
        void StartDownload(JsonDownloadInfo download);
        void StartConnection(IrcSettings settings);
        void StopConnection();
        void StopDownload();
        bool IsDownloading();
        bool IsConnected();
        IrcSettings CurrentSettings();
    }

    public class IrcClientHandler : IIrcClientHandler, IDebugEvent, ISettingsInterface
    {


        public event EventHandler<BaseDebugArgs> OnIrcClientMessageDebugEvent;

        public event EventHandler<IrcClientMessageEventArgs> OnIrcClientMessageEvent;
        public event EventHandler<IrcClientDownloadEventArgs> OnIrcClientDownloadEvent;
        public event EventHandler<IrcClientConnectionStatusArgs> OnIrcClientConnectionStatusEvent;
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly ISettingsHandler SettingsHandler;

        private SimpleIRC IrcClient;
        private IrcSettings IrcSettings;
        private LittleWeebSettings LittleWeebSettings;

        public IrcClientHandler(ISettingsHandler settingsHandler)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "IrcClientHandler called.",
                DebugSourceType = 0,
                DebugType = 0
            });


            SettingsHandler = settingsHandler;


            IrcSettings = new IrcSettings();
            LittleWeebSettings = new LittleWeebSettings();

            IrcClient = new SimpleIRC();
            IrcClient.IrcClient.OnUserListReceived += OnUserListUpdate;
            IrcClient.IrcClient.OnMessageReceived += OnMessage;
            IrcClient.IrcClient.OnDebugMessage += OnMessageDebug;
            IrcClient.DccClient.OnDccEvent += OnDownloadUpdate;
            IrcClient.DccClient.OnDccDebugMessage += OnDownloadUpdateDebug;

            

        }

        public void SetIrcSettings(IrcSettings settings)
        {
            IrcSettings = settings;
        }

        public void SetLittleWeebSettings(LittleWeebSettings settings)
        {
            LittleWeebSettings = settings;
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
                if (IrcClient != null)
                {
                    if (IrcClient.IsClientRunning())
                    {
                        IrcClient.SendMessageToAll(message);
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

        public void StartDownload(JsonDownloadInfo download)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "StartDownload called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = download.ToJson(),
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                string xdccMessage = "/msg " + download.bot + " xdcc send #" + download.pack;
                IrcClient.SetCustomDownloadDir(Path.Combine(LittleWeebSettings.BaseDownloadDir, download.downloadDirectory));
                SendMessage(xdccMessage);
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

        public void StartConnection(IrcSettings settings = null)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "StartConnection called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = settings.ToString(),
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                if (settings != null)
                {
                    IrcSettings = settings;
                }
                IrcClient.SetupIrc(IrcSettings.ServerAddress, IrcSettings.UserName, IrcSettings.Channels, IrcSettings.Port, "", 3000, IrcSettings.Secure);
                if (!IrcClient.StartClient())
                {
                    OnIrcClientConnectionStatusEvent?.Invoke(this, new IrcClientConnectionStatusArgs()
                    {
                        Connected = false,
                        ChannelsAndUsers = null
                    });

                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugSource = this.GetType().Name,
                        DebugMessage = "Could not connect to IRC server.",
                        DebugSourceType = 1,
                        DebugType = 3
                    });
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

        public void StopConnection()
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "StopConnection called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            try
            {
                if (IrcClient.StopClient())
                {
                    OnIrcClientConnectionStatusEvent?.Invoke(this, new IrcClientConnectionStatusArgs()
                    {
                        Connected = false,
                        ChannelsAndUsers = null
                    });

                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugSource = this.GetType().Name,
                        DebugMessage = "Succesfully stopped IRC Client.",
                        DebugSourceType = 1,
                        DebugType = 2
                    });
                }
                else
                {
                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugSource = this.GetType().Name,
                        DebugMessage = "Could not stop connection with IRC server.",
                        DebugSourceType = 1,
                        DebugType = 3
                    });
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

        public void StopDownload()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "StopDownload called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            if (!IrcClient.StopXDCCDownload())
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name,
                    DebugMessage = "Could not stop download.",
                    DebugSourceType = 1,
                    DebugType = 3
                });
            }
            else
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name,
                    DebugMessage = "Succesfully stopped Download.",
                    DebugSourceType = 1,
                    DebugType = 2
                });
            }
        }

        public bool IsDownloading()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "IsDownloading called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            return IrcClient.CheckIfDownload();
        }

        public bool IsConnected()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "IsConnected called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            try
            {
                return IrcClient.IsClientRunning();
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
                return false;
            }
        }

        public IrcSettings CurrentSettings()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "CurrentSettings called.",
                DebugSourceType = 1,
                DebugType = 0
            });
            return IrcSettings;
        }

        private void OnMessage(object sender, IrcReceivedEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = " OnMessage called.",
                DebugSourceType = 2,
                DebugType = 0
            });

            IrcClientMessageEventArgs eventArgs = new IrcClientMessageEventArgs()
            {
                Channel = args.Channel,
                User = args.User,
                Message = args.Message
            };

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = eventArgs.ToString(),
                DebugSourceType = 2,
                DebugType = 1
            });

            OnIrcClientMessageEvent?.Invoke(this, eventArgs);
        }

        private void OnMessageDebug(object sender, IrcDebugMessageEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = " OnMessageDebug called.",
                DebugSourceType = 2,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage =  args.Type + " || " + args.Message,
                DebugSourceType = 4,
                DebugType = 4
            });
        }

        private void OnUserListUpdate(object sender, IrcUserListReceivedEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = " OnUserListUpdate called.",
                DebugSourceType = 2,
                DebugType = 0
            });

            try
            {
                if (args.UsersPerChannel.Count > 0)
                {

                    IrcClientConnectionStatusArgs eventArgs = new IrcClientConnectionStatusArgs()
                    {
                        ChannelsAndUsers = args.UsersPerChannel,
                        Connected = true
                    };

                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                        DebugMessage = eventArgs.ToString(),
                        DebugSourceType = 2,
                        DebugType = 1
                    });

                    OnIrcClientConnectionStatusEvent?.Invoke(this, eventArgs);
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

        private void OnDownloadUpdate(object sender, DCCEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = "OnDownloadUpdate called.",
                DebugSourceType = 2,
                DebugType = 0
            });

            IrcClientDownloadEventArgs eventArgs = new IrcClientDownloadEventArgs()
            {
                FileName = args.FileName,
                FileLocation = args.FilePath,
                DownloadSpeed = args.KBytesPerSecond.ToString(),
                FileSize = (args.FileSize / 1048576),
                DownloadProgress = args.Progress,
                DownloadStatus = args.Status
            };

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = eventArgs.ToString(),
                DebugSourceType = 2,
                DebugType = 1
            });

            OnIrcClientDownloadEvent?.Invoke(this, eventArgs);
        }

        private void OnDownloadUpdateDebug(object sender, DCCDebugMessageArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = " OnDownloadUpdateDebug called.",
                DebugSourceType = 2,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = args.Type + " || " + args.Message,
                DebugSourceType = 4,
                DebugType = 4
            });
        }
    }
}
