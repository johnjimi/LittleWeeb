using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Handlers
{
    public interface IFileHistoryHandler
    {
        void AddFileToFileHistory(JsonAnimeInfo animeInfo, JsonDownloadInfo downloadInfo);
        void RemoveFileFromFileHistory(JsonDownloadInfo downloadInfo);
        JsonDownloadHistoryList GetCurrentFileHistory();
    }
    public class FileHistoryHandler : IFileHistoryHandler, IDebugEvent
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly IWebSocketHandler WebSocketHandler;

        private readonly string fileHistoryPath = "";
        private readonly string fileName = "";

        public FileHistoryHandler(IWebSocketHandler webSocketHandler)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });

            WebSocketHandler = webSocketHandler;

#if __ANDROID__
            fileHistoryPath = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.ExternalStorageDirectory), "LittleWeeb"), "FileHistory");
#else
            fileHistoryPath = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LittleWeeb"), "FileHistory");
#endif
            fileName = "FileHistory.json";

        }

        public void AddFileToFileHistory(JsonAnimeInfo animeInfo, JsonDownloadInfo downloadInfo)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "AddFileToFileHistory called.",
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

            if (!File.Exists(Path.Combine(fileHistoryPath, fileName)))
            {

                JsonDownloadHistory downloadHistoryObj = new JsonDownloadHistory()
                {
                    animeInfo = animeInfo
                };

                downloadHistoryObj.downloadHistory.Add(downloadInfo);

                JsonDownloadHistoryList list = new JsonDownloadHistoryList();
                if (!list.downloadHistorylist.Contains(downloadHistoryObj))
                {
                    list.downloadHistorylist.Add(downloadHistoryObj);

                    using (var streamWriter = new StreamWriter(Path.Combine(fileHistoryPath, fileName), false))
                    {
                        streamWriter.Write(list.ToJson());
                    }
                }
            }
            else
            {
                JsonDownloadHistoryList list = GetCurrentFileHistory();
                JsonDownloadHistory downloadHistoryObj = new JsonDownloadHistory()
                {
                    animeInfo = animeInfo
                };

                downloadHistoryObj.downloadHistory.Add(downloadInfo);

                int indexOfAlreadyAdded = -1;
                if ((indexOfAlreadyAdded = list.downloadHistorylist.IndexOf(downloadHistoryObj)) == -1)
                {
                    list.downloadHistorylist.Add(downloadHistoryObj);

                    using (var streamWriter = new StreamWriter(Path.Combine(fileHistoryPath, fileName), false))
                    {
                        streamWriter.Write(list.ToJson());
                    }
                }
                else
                {
                    list.downloadHistorylist[indexOfAlreadyAdded] = downloadHistoryObj;
                }
            }
        }

        public void RemoveFileFromFileHistory(JsonDownloadInfo downloadInfo)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "RemoveFileFromFileHistory called.",
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

            if (File.Exists(Path.Combine(fileHistoryPath, fileName)))
            {


                JsonDownloadHistoryList list = GetCurrentFileHistory();

                int indexList = -1;
                int indexDownloadInfo = -1;
                foreach (JsonDownloadHistory history in list.downloadHistorylist)
                {
                    indexDownloadInfo = -1;
                    foreach (JsonDownloadInfo download in history.downloadHistory)
                    {
                        indexDownloadInfo++;
                        if (download.filename == downloadInfo.filename)
                        {
                            break;
                        }
                    }

                    indexList++;

                    if (indexDownloadInfo >= 0)
                    {
                        break;
                    }

                }

                if (indexList >= 0)
                {
                    list.downloadHistorylist[indexList].downloadHistory.RemoveAt(indexDownloadInfo);

                    if (indexDownloadInfo == 0) {
                        list.downloadHistorylist.RemoveAt(indexList);
                    }
                }

                using (var streamWriter = new StreamWriter(Path.Combine(fileHistoryPath, fileName), false))
                {
                    streamWriter.Write(list.ToJson());
                }
            }
        }

        public JsonDownloadHistoryList GetCurrentFileHistory()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "GetCurrentFileHistory called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1, 
                DebugType = 0
            });

            string readContent = "";
            using (var streamReader = new StreamReader(Path.Combine(fileHistoryPath, fileName)))
            {
                readContent = streamReader.ReadToEnd();
            }

            return JsonConvert.DeserializeObject<JsonDownloadHistoryList>(readContent);
        }
    }
}
