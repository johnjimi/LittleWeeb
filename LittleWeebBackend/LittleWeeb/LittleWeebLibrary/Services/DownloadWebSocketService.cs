using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Services
{
    public interface IDownloadWebSocketService
    {
        void AddDownload(JObject downloadJson);
        void RemoveDownload(JObject downloadJson);
        void OpenDownloadDirectory();
        void GetCurrentFileHistory();
    }
    public class DownloadWebSocketService : IDownloadWebSocketService, IDebugEvent, ISettingsInterface
    {

        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IDirectoryHandler DirectoryHandler;
        private readonly IDownloadHandler DownloadHandler;
        private readonly IFileHistoryHandler FileHistoryHandler;
        private readonly ISettingsHandler SettingsHandler;
        private LittleWeebSettings LittleWeebSettings;
        private IrcSettings IrcSettings;

        private JsonDownloadInfo LastDownloadedInfo;

        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        public DownloadWebSocketService(
            LittleWeebSettings littleWeebSettings, 
            IrcSettings ircSettings, 
            IWebSocketHandler webSocketHandler, 
            IDirectoryHandler directoryHandler,
            IDownloadHandler downloadHandler,  
            IFileHistoryHandler fileHistoryHandler,
            ISettingsHandler settingsHandler)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });

            LittleWeebSettings = littleWeebSettings;
            IrcSettings = ircSettings;
            WebSocketHandler = webSocketHandler;
            DirectoryHandler = directoryHandler;
            DownloadHandler = downloadHandler;
            FileHistoryHandler = fileHistoryHandler;
            SettingsHandler = settingsHandler;
            LastDownloadedInfo = new JsonDownloadInfo();

            downloadHandler.OnDownloadUpdateEvent += OnDownloadUpdateEvent;
        }

        public void AddDownload(JObject downloadJson)
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
                DebugMessage = downloadJson.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                JsonDownloadInfo downloadInfo = new JsonDownloadInfo()
                {
                    animeInfo = new JsonAnimeInfo()
                    {
                        animeid = downloadJson.Value<JObject>("animeInfo").Value<string>("animeid"),
                        title = downloadJson.Value<JObject>("animeInfo").Value<string>("title"),
                        cover_original = downloadJson.Value<JObject>("animeInfo").Value<string>("cover_original"),
                        cover_small = downloadJson.Value<JObject>("animeInfo").Value<string>("cover_small")
                    },
                    id = downloadJson.Value<string>("id"),
                    episodeNumber = downloadJson.Value<string>("episodeNumber"),
                    pack = downloadJson.Value<string>("pack"),
                    bot = downloadJson.Value<string>("bot"),
                    downloadDirectory = downloadJson.Value<string>("dir"),
                    filename = downloadJson.Value<string>("filename"),
                    progress = downloadJson.Value<string>("progress"),
                    speed = downloadJson.Value<string>("speed"),
                    status = downloadJson.Value<string>("status")
                };

                LastDownloadedInfo = downloadInfo;

                string result = DownloadHandler.AddDownload(downloadInfo);

                WebSocketHandler.SendMessage(result);
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
                    type = "parse_download_to_add_error",
                    errormessage = "Could not parse json containing download to add information.",
                    errortype = "exception"
                };


                WebSocketHandler.SendMessage(error.ToJson());
            }
        }

        public void RemoveDownload(JObject downloadJson)
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
                DebugMessage = downloadJson.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                JsonDownloadInfo downloadInfo = new JsonDownloadInfo()
                {
                    animeInfo = new JsonAnimeInfo()
                    {
                        animeid = downloadJson.Value<JObject>("animeInfo").Value<string>("animeid"),
                        title = downloadJson.Value<JObject>("animeInfo").Value<string>("title"),
                        cover_original = downloadJson.Value<JObject>("animeInfo").Value<string>("cover_original"),
                        cover_small = downloadJson.Value<JObject>("animeInfo").Value<string>("cover_small")
                    },
                    id = downloadJson.Value<string>("id"),
                    episodeNumber = downloadJson.Value<string>("episodeNumber"),
                    pack = downloadJson.Value<string>("pack"),
                    bot = downloadJson.Value<string>("bot"),
                    downloadDirectory = downloadJson.Value<string>("dir"),
                    filename = downloadJson.Value<string>("filename"),
                    progress = downloadJson.Value<string>("progress"),
                    speed = downloadJson.Value<string>("speed"),
                    status = downloadJson.Value<string>("status")
                };

                FileHistoryHandler.RemoveFileFromFileHistory(downloadInfo);

                string result = DownloadHandler.RemoveDownload(downloadInfo);
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
                    type = "parse_download_to_remove_error",
                    errormessage = "Could not parse json containing download to remove information.",
                    errortype = "exception"
                };


                WebSocketHandler.SendMessage(error.ToJson());
            }

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

        public void OpenDownloadDirectory()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "OpenDownloadDirectory called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            string result = DirectoryHandler.OpenDirectory(IrcSettings.DownloadDirectory);
            WebSocketHandler.SendMessage(result);
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
                    animeInfo = new JsonAnimeInfo()
                    {
                        animeid = args.animeid,
                        cover_original = args.animeCoverOriginal,
                        cover_small = args.animeCoverSmall,
                        title = args.animeTitle
                    },
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

                FileHistoryHandler.AddFileToFileHistory(update);
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

        public void SetIrcSettings(IrcSettings settings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name ,
                DebugMessage = "SetIrcSettings called.",
                DebugSourceType = 1,
                DebugType = 0
            });
            IrcSettings = settings;
        }

        public void SetLittleWeebSettings(LittleWeebSettings settings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "SetLittleWeebSettings called.",
                DebugSourceType = 1,
                DebugType = 0
            });
            LittleWeebSettings = settings;
        }
    }
}
