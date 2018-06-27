using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Handlers
{
    public interface IDirectoryHandler
    {

    }
    public class DirectoryHandler : IDebugEvent, IDirectoryHandler, ISettingsInterface
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly ISettingsHandler SettingsHandler;
        private readonly IIrcClientHandler IrcClientHandler;
        private readonly IWebSocketHandler WebSocketHandler;

        private IrcSettings IrcSettings;
        private LittleWeebSettings LittleWeebSettings;
        public DirectoryHandler()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });


        }

        public void SetIrcSettings(IrcSettings settings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = settings.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            IrcSettings = settings;
        }

        public void SetLittleWeebSettings(LittleWeebSettings settings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = settings.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            LittleWeebSettings = settings;
        }
    }
}
