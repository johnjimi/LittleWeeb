using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Services
{
    public class SettingsWebSocketService : IDebugEvent
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IIrcClientHandler IrcClientHandler;
        private readonly ISettingsHandler SettingsHandler;
        private readonly ISettingsInterface WebSocketHandlerSettings;
        private readonly ISettingsInterface IrcClientHandlerSettings;
        private readonly ISettingsInterface DebugHandlerSettings;
        private readonly ISettingsInterface FileHandlerSettings;

        private LittleWeebSettings LittleWeebSettings;
        private IrcSettings IrcSettings;

        public SettingsWebSocketService(IWebSocketHandler webSocketHandler, ISettingsHandler settingsHandler, IIrcClientHandler ircClientHandler, IDebugHandler debugHandler, IFileHandler fileHandler)
        {
            WebSocketHandler = webSocketHandler;
            SettingsHandler= settingsHandler;
            IrcClientHandler = ircClientHandler;

            WebSocketHandlerSettings = webSocketHandler as ISettingsInterface;
            IrcClientHandlerSettings = ircClientHandler as ISettingsInterface;
            DebugHandlerSettings = debugHandler as ISettingsInterface;
            FileHandlerSettings = fileHandler as ISettingsInterface;

            LittleWeebSettings = settingsHandler.GetLittleWeebSettings();
            IrcSettings = settingsHandler.GetIrcSettings();
            
            IrcClientHandlerSettings.SetLittleWeebSettings(LittleWeebSettings);
            DebugHandlerSettings.SetLittleWeebSettings(LittleWeebSettings);
            FileHandlerSettings.SetLittleWeebSettings(LittleWeebSettings);

            IrcClientHandlerSettings.SetIrcSettings(IrcSettings);
            SettingsHandler.WriteIrcSettings(IrcSettings);

        }

        public void GetCurrentIrcSettings()
        {
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

            LittleWeebSettings = SettingsHandler.GetLittleWeebSettings();

            JsonLittleWeebSettings settings = new JsonLittleWeebSettings()
            {
                port = LittleWeebSettings.Port,
                local = LittleWeebSettings.Local,
                version = LittleWeebSettings.Version,
                randomusernamelength = LittleWeebSettings.RandomUsernameLength,
                debuglevel = LittleWeebSettings.DebugLevel,
                maxdebuglogsize = LittleWeebSettings.MaxDebugLogSize,
                basedownloaddir = LittleWeebSettings.BaseDownloadDir
            };
            WebSocketHandler.SendMessage(settings.ToJson());
        }

        public void SetIrcSettings(JsonIrcInfo ircInfo)
        {
            IrcSettings = new IrcSettings()
            {
                Channels = ircInfo.channel,
                ServerAddress = ircInfo.server,
                UserName = ircInfo.user,
                DownloadDirectory = ircInfo.downloadlocation

            };

            IrcClientHandlerSettings.SetIrcSettings(IrcSettings);
            SettingsHandler.WriteIrcSettings(IrcSettings);
            GetCurrentIrcSettings();
        }

        public void SetLittleWeebSettings(JsonLittleWeebSettings littleWeebSettings)
        {

            LittleWeebSettings = SettingsHandler.GetLittleWeebSettings();

            LittleWeebSettings.Port = littleWeebSettings.port;
            LittleWeebSettings.Local = littleWeebSettings.local;
            LittleWeebSettings.Version = littleWeebSettings.version;
            LittleWeebSettings.RandomUsernameLength = littleWeebSettings.randomusernamelength;
            LittleWeebSettings.DebugLevel = littleWeebSettings.debuglevel;
            LittleWeebSettings.MaxDebugLogSize = littleWeebSettings.maxdebuglogsize;
            LittleWeebSettings.BaseDownloadDir = littleWeebSettings.basedownloaddir;

            IrcClientHandlerSettings.SetLittleWeebSettings(LittleWeebSettings);
            DebugHandlerSettings.SetLittleWeebSettings(LittleWeebSettings);
            FileHandlerSettings.SetLittleWeebSettings(LittleWeebSettings);


            SettingsHandler.WriteLittleWeebSettings(LittleWeebSettings);

            GetCurrentLittleWeebSettings();


        }
        
    }
}
