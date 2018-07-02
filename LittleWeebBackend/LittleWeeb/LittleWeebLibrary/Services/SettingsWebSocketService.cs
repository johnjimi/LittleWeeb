using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Services
{
    public interface ISettingsWebSocketService
    {
        void GetCurrentIrcSettings();
        void GetCurrentLittleWeebSettings();
        void SetIrcSettings(JObject jsonIrcSettings);
        void SetLittleWeebSettings(JObject jsonLittleWeebSettings);
        void SetDownloadDirectory(JObject downloadDirectoryJson);
    }
    public class SettingsWebSocketService : ISettingsWebSocketService, IDebugEvent
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IIrcClientHandler IrcClientHandler;
        private readonly ISettingsHandler SettingsHandler;
        private readonly IDirectoryHandler DirectoryHandler;
        private readonly IDownloadHandler DownloadHandler;
        private readonly IDirectoryWebSocketService DirectoryWebSocketService;
        private readonly IIrcWebSocketService IrcWebSocketService;
        private readonly ISettingsInterface WebSocketHandlerSettings;
        private readonly ISettingsInterface IrcClientHandlerSettings;
        private readonly ISettingsInterface DebugHandlerSettings;
        private readonly ISettingsInterface FileHandlerSettings;
        private readonly ISettingsInterface DownloadHandlerSettings;
        private readonly ISettingsInterface DirectoryWebSocketServiceSettings;
        private readonly ISettingsInterface IrcWebSocketServiceSettings;
        private LittleWeebSettings LittleWeebSettings;
        private IrcSettings IrcSettings;

        public SettingsWebSocketService(
            IWebSocketHandler webSocketHandler,
            ISettingsHandler settingsHandler,
            IIrcClientHandler ircClientHandler,
            IDebugHandler debugHandler,
            IFileHandler fileHandler, 
            IDirectoryHandler directoryHandler,
            IDownloadHandler downloadHandler,
            IDirectoryWebSocketService directoryWebSocketService,
            IIrcWebSocketService ircWebSocketService
            )
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });

            WebSocketHandler = webSocketHandler;
            SettingsHandler= settingsHandler;
            IrcClientHandler = ircClientHandler;
            DownloadHandler = downloadHandler;
            DirectoryWebSocketService = directoryWebSocketService;
            IrcWebSocketService = ircWebSocketService;


            WebSocketHandlerSettings = webSocketHandler as ISettingsInterface;
            IrcClientHandlerSettings = ircClientHandler as ISettingsInterface;
            DebugHandlerSettings = debugHandler as ISettingsInterface;
            FileHandlerSettings = fileHandler as ISettingsInterface;
            DownloadHandlerSettings = downloadHandler as ISettingsInterface;
            DirectoryWebSocketServiceSettings = directoryWebSocketService as ISettingsInterface; 
            IrcWebSocketServiceSettings = ircWebSocketService as ISettingsInterface;

            LittleWeebSettings = settingsHandler.GetLittleWeebSettings();
            IrcSettings = settingsHandler.GetIrcSettings();

            SetAllIrcSettings(IrcSettings);
            SetAllLittleWeebSettings(LittleWeebSettings);
            SettingsHandler.WriteIrcSettings(IrcSettings);

        }

        public void GetCurrentIrcSettings()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "GetCurrentIrcSettings called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            IrcSettings = SettingsHandler.GetIrcSettings();
            JsonIrcInfo info = new JsonIrcInfo()
            {
                channel = IrcSettings.Channels,
                server = IrcSettings.ServerAddress,
                user = IrcSettings.UserName,
                downloadlocation = IrcSettings.DownloadDirectory
            };

            WebSocketHandler.SendMessage(info.ToJson());

        }

        public void GetCurrentLittleWeebSettings()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "GetCurrentLittleWeebSettings called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            LittleWeebSettings = SettingsHandler.GetLittleWeebSettings();

            JsonLittleWeebSettings settings = new JsonLittleWeebSettings()
            {
                port = LittleWeebSettings.Port,
                local = LittleWeebSettings.Local,
                version = LittleWeebSettings.Version,
                randomusernamelength = LittleWeebSettings.RandomUsernameLength,
                debuglevel = LittleWeebSettings.DebugLevel,
                maxdebuglogsize = LittleWeebSettings.MaxDebugLogSize
            };
            WebSocketHandler.SendMessage(settings.ToJson());
        }

        public void SetIrcSettings(JObject jsonIrcSettings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "SetIrcSettings called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = jsonIrcSettings.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                IrcSettings = SettingsHandler.GetIrcSettings();

                IrcSettings.ServerAddress = jsonIrcSettings.Value<string>("address");
                IrcSettings.Channels = jsonIrcSettings.Value<string>("channels");
                IrcSettings.UserName = jsonIrcSettings.Value<string>("username");
                IrcSettings.DownloadDirectory = jsonIrcSettings.Value<string>("downloadDirectory");

                SetAllIrcSettings(IrcSettings);
                SettingsHandler.WriteIrcSettings(IrcSettings);
                GetCurrentIrcSettings();
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugMessage = e.ToString(),
                    DebugSource = this.GetType().Name,
                    DebugSourceType = 1,
                    DebugType = 4
                });

                JsonError error = new JsonError();
                error.type = "set_irc_settings_error";
                error.errortype = "Exception";
                error.errormessage = "Failed to set irc settings.";

                WebSocketHandler.SendMessage(error.ToJson());
            }
        }

        public void SetLittleWeebSettings(JObject jsonLittleWeebSettings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "SetLittleWeebSettings called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = jsonLittleWeebSettings.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                LittleWeebSettings = SettingsHandler.GetLittleWeebSettings();

                LittleWeebSettings.RandomUsernameLength = jsonLittleWeebSettings.Value<int>("randomusernamelength");
                LittleWeebSettings.DebugLevel = jsonLittleWeebSettings.Value<List<int>>("debuglevel");
                LittleWeebSettings.MaxDebugLogSize = jsonLittleWeebSettings.Value<int>("maxdebuglogsize");
                SetAllLittleWeebSettings(LittleWeebSettings);


                SettingsHandler.WriteLittleWeebSettings(LittleWeebSettings);

                GetCurrentLittleWeebSettings();
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugMessage = e.ToString(),
                    DebugSource = this.GetType().Name,
                    DebugSourceType = 1,
                    DebugType = 4
                });

                JsonError error = new JsonError();
                error.type = "set_littleweeb_settings_error";
                error.errortype = "Exception";
                error.errormessage = "Failed to set littleweeb settings.";

                WebSocketHandler.SendMessage(error.ToJson());
            }
        }

        public void SetDownloadDirectory(JObject downloadDirectoryJson)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "SetDownloadDirectory called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = downloadDirectoryJson.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            try
            {
                string path = downloadDirectoryJson.Value<string>("path");
                DirectoryHandler.CreateDirectory(path, "");
                IrcSettings.DownloadDirectory = path;
                SetAllIrcSettings(IrcSettings);
                SettingsHandler.WriteIrcSettings(IrcSettings);
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugMessage = e.ToString(),
                    DebugSource = this.GetType().Name,
                    DebugSourceType = 1,
                    DebugType = 4
                });

                JsonError error = new JsonError();
                error.type = "set_download_directory_error";
                error.errortype = "Exception";
                error.errormessage = "Failed to set custom download directory.";

                WebSocketHandler.SendMessage(error.ToJson());
            }

        }

        private void SetAllLittleWeebSettings(LittleWeebSettings settings)
        {
            IrcClientHandlerSettings.SetLittleWeebSettings(settings);
            DebugHandlerSettings.SetLittleWeebSettings(settings);
            FileHandlerSettings.SetLittleWeebSettings(settings);
            DownloadHandlerSettings.SetLittleWeebSettings(settings);
            DirectoryWebSocketServiceSettings.SetLittleWeebSettings(settings);
            IrcWebSocketServiceSettings.SetLittleWeebSettings(settings);
        }

        private void SetAllIrcSettings(IrcSettings settings)
        {
            IrcClientHandlerSettings.SetIrcSettings(settings);
            DebugHandlerSettings.SetIrcSettings(settings);
            FileHandlerSettings.SetIrcSettings(settings);
            DownloadHandlerSettings.SetIrcSettings(settings);
            DirectoryWebSocketServiceSettings.SetIrcSettings(settings);
            IrcWebSocketServiceSettings.SetIrcSettings(settings);
        }
    }
}
