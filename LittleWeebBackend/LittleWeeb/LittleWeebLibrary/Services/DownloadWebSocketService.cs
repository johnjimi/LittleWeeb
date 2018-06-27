using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Services
{
    public interface IDownloadWebSocketService
    {

    }
    public class DownloadWebSocketService : IDownloadWebSocketService, IDebugEvent
    {

        private readonly IIrcClientHandler IrcClientHandler;
        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IDownloadHandler DownloadHandler;
        private readonly IFileHistoryHandler FileHistoryHandler;
        private readonly ISettingsHandler SettingsHandler;
        private readonly LittleWeebSettings LittleWeebSettings;

        private JsonAnimeInfo LastDownloadedAnimeInfo;

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        public DownloadWebSocketService(LittleWeebSettings littleWeebSettings, IWebSocketHandler webSocketHandler, IIrcClientHandler ircClientHandler, IDownloadHandler downloadHandler, IFileHistoryHandler fileHistoryHandler, ISettingsHandler settingsHandler)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });

            LittleWeebSettings = littleWeebSettings;

            IrcClientHandler = ircClientHandler;
            WebSocketHandler = webSocketHandler;
            DownloadHandler = downloadHandler;
            FileHistoryHandler = fileHistoryHandler;
            SettingsHandler = settingsHandler;
            LastDownloadedAnimeInfo = new JsonAnimeInfo();

            downloadHandler.OnDownloadUpdateEvent += OnDownloadUpdateEvent;
        }

        public void AddDownload(JsonAnimeInfo animeInfo, JsonDownloadInfo downloadInfo)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "AddDownload called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = animeInfo.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = downloadInfo.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            LastDownloadedAnimeInfo = animeInfo;

            DownloadHandler.AddDownload(downloadInfo);

        }

        public void RemoveDownload(JsonDownloadInfo downloadInfo)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "RemoveDownload called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = downloadInfo.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            FileHistoryHandler.RemoveFileFromFileHistory(downloadInfo);

            DownloadHandler.RemoveDownload(downloadInfo);           

        }

        public void GetCurrentFileHistory()
        {
       
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "GetCurrentFileHistory called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            WebSocketHandler.SendMessage(FileHistoryHandler.GetCurrentFileHistory().ToJson());
        }

        public void SetDownloadDirectory(string path)
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
                DebugMessage = path,
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            try
            {
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }

                IrcClientHandler.SetDownloadDirectory(path);
                IrcSettings localIrcSettings = IrcClientHandler.CurrentSettings();
                localIrcSettings.DownloadDirectory = path;

                SettingsHandler.WriteIrcSettings(localIrcSettings);
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
                error.errortype = "Exception";
                error.errormessage = "Failed to set custom download directory.";

                WebSocketHandler.SendMessage(error.ToJson());
            }

        }

        private void OnDownloadUpdateEvent(object sender, DownloadUpdateEventArgs args)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = "OnDownloadUpdateEvent called.",
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
                JsonDownloadInfo update = new JsonDownloadInfo()
                {
                    id = args.id,
                    animeid = args.animeid,
                    episodeNumber = args.episodeNumber,
                    bot = args.bot,
                    pack = args.pack,
                    progress = args.progress,
                    speed = args.speed,
                    status = args.status,
                    filename = args.filename,
                    filesize = args.filesize,
                    downloadIndex = args.downloadIndex,
                    downloadDirectory = args.downloadDirectory
                };

                WebSocketHandler.SendMessage(update.ToJson());

                FileHistoryHandler.AddFileToFileHistory(LastDownloadedAnimeInfo, update);
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                    DebugMessage = e.ToString(),
                    DebugSourceType = 2,
                    DebugType = 4
                });
            }
        }    
    }
}
