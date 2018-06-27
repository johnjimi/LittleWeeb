using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Handlers
{
    public interface IFileHandler
    {
        event EventHandler<FileHandlerDebugEventArgs> OnFileHandlerDebugEvent;
        void OpenFile(string filePath, string fileName = null);
        void OpenFileDirectory(string directoryPath);
        void DeleteFile(string filePath, string fileName = null);
    }
    public class FileHandler : IFileHandler, IDebugEvent, ISettingsInterface
    {
        public event EventHandler<FileHandlerDebugEventArgs> OnFileHandlerDebugEvent;
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IWebSocketHandler WebSocketHandler;

        private LittleWeebSettings LittleWeebSettings;

        public FileHandler(IWebSocketHandler webSocketHandler)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });

            WebSocketHandler = webSocketHandler;
        }

        public void OpenFile(string filePath, string fileName = null)
        {

        }

        public void OpenFileDirectory(string directoryPath)
        {

        }

        public void DeleteFile(string filePath, string fileName = null)
        {
        }

        public void SetIrcSettings(IrcSettings settings)
        {
            throw new NotImplementedException();
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
