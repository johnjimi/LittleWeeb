using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using LittleWeebLibrary.StaticClasses;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LittleWeebLibrary.Handlers
{
    public interface IDownloadHandler
    {
        event EventHandler<DownloadUpdateEventArgs> OnDownloadUpdateEvent;
        string AddDownload(JsonDownloadInfo download);
        string RemoveDownload(JsonDownloadInfo download);
        string RemoveDownload(string filePath);
        string GetCurrentlyDownloading();
        string StopQueue();
    }

    public class DownloadHandler : IDownloadHandler, IDebugEvent, ISettingsInterface
    {
        public event EventHandler<DownloadUpdateEventArgs> OnDownloadUpdateEvent;
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private List<JsonDownloadInfo> DownloadQueue;
        private IIrcClientHandler IrcClientHandler;
        private bool Stop;
        private bool IsDownloading;
        private JsonDownloadInfo CurrentlyDownloading;
        private IrcSettings IrcSettings;

        public DownloadHandler(IIrcClientHandler ircClientHandler)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });


            try
            {
                DownloadQueue = new List<JsonDownloadInfo>();
                IrcClientHandler = ircClientHandler;
                IrcClientHandler.OnIrcClientDownloadEvent += OnIrcClientDownloadEvent;
                CurrentlyDownloading = new JsonDownloadInfo();
                Stop = false;

                Task.Run(async () => await DownloadQueueHandler());
            }
            catch (Exception e)
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name,
                    DebugMessage = e.ToString(),
                    DebugSourceType = 0,
                    DebugType = 4
                });
            }           

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "Constructor exited.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 0,
                DebugType = 0
            });
        }

        public string AddDownload(JsonDownloadInfo download)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "AddDownload Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = download.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });
            try
            {
                if (UtilityMethods.GetFreeSpace(IrcSettings.DownloadDirectory) > (int.Parse(download.filesize) * 1024 * 1024))
                {

                    DownloadQueue.Add(download);

                    JsonSuccesReport succes = new JsonSuccesReport()
                    {
                        message = "Succesfully added download to download que."
                    };

                    return succes.ToJson();
                }
                else
                {
                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugMessage = "Could not add download with filesize: " + download.filesize + " due to insufficient space required: " + (UtilityMethods.GetFreeSpace(IrcSettings.DownloadDirectory) / 1024 / 1024).ToString(),
                        DebugSource = this.GetType().Name,
                        DebugSourceType = 1,
                        DebugType = 3
                    });

                    JsonError error = new JsonError()
                    {
                        type = "unsufficient_space_error",
                        errormessage = "Could not add download with filesize: " + download.filesize + " due to insufficient space required: " + (UtilityMethods.GetFreeSpace(IrcSettings.DownloadDirectory) / 1024 / 1024).ToString(),
                        errortype = "warning"
                    };
                    return error.ToJson();
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


                JsonError error = new JsonError()
                {
                    type = "add_download_error",
                    errormessage = "Could not add download to que.",
                    errortype = "exception"
                };
                return error.ToJson();
            }
        }

        public string RemoveDownload(JsonDownloadInfo download)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "RemoveDownload Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = download.ToString(),
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try{
                if (!DownloadQueue.Remove(download))
                {
                    IrcClientHandler.StopDownload();
                } 

                JsonSuccesReport succes = new JsonSuccesReport()
                {
                    message = "Succesfully removed download from download que by download json."
                };

                return succes.ToJson();
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
                    type = "remove_download_error",
                    errormessage = "Could not remove download from que by download json.",
                    errortype = "exception"
                };
                return error.ToJson();
            }
        }

        public string RemoveDownload(string filePath)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "RemoveDownload Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = filePath,
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                if (IsDownloading)
                {
                    if (Path.Combine(CurrentlyDownloading.downloadDirectory, CurrentlyDownloading.filename) == filePath)
                    {
                        IrcClientHandler.StopDownload();
                    }
                }

                JsonSuccesReport succes = new JsonSuccesReport()
                {
                    message = "Succesfully removed download from download que by filepath."
                };

                return succes.ToJson();
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
                    type = "remove_download_error",
                    errormessage = "Could not remove download from que by download json by filepath.",
                    errortype = "exception"
                };
                return error.ToJson();
            }
        }

        public string StopQueue() {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "StopQueue Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            Stop = true;

            JsonSuccesReport succes = new JsonSuccesReport()
            {
                message = "Succesfully told queue to stop running."
            };

            return succes.ToJson();
        }

        public string GetCurrentlyDownloading()
        {
            return CurrentlyDownloading.ToJson();
        }

        private void OnIrcClientDownloadEvent(object sender, IrcClientDownloadEventArgs args)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name + " via " + sender.GetType().Name + " via " + sender.GetType().Name,
                DebugMessage = "OnIrcClientDownloadEvent called.",
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

            if (CurrentlyDownloading != null)
            {
                OnDownloadUpdateEvent?.Invoke(this, new DownloadUpdateEventArgs()
                {
                    id = CurrentlyDownloading.id,
                    animeid = CurrentlyDownloading.animeInfo.animeid,
                    animeTitle = CurrentlyDownloading.animeInfo.title,
                    animeCoverSmall = CurrentlyDownloading.animeInfo.cover_small,
                    animeCoverOriginal = CurrentlyDownloading.animeInfo.cover_original,
                    episodeNumber = CurrentlyDownloading.episodeNumber,
                    bot = CurrentlyDownloading.bot,
                    pack = CurrentlyDownloading.pack,
                    progress = args.DownloadProgress.ToString(),
                    speed = args.DownloadSpeed.ToString(),
                    status = args.DownloadStatus,
                    filename = args.FileName,
                    filesize = args.FileSize.ToString(),
                    downloadDirectory = args.FileLocation,
                    downloadIndex = CurrentlyDownloading.downloadIndex
                });
            }
            else
            {
                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugSource = this.GetType().Name + " via " + sender.GetType().Name,
                    DebugMessage = "Got download event, but no CurrrentlyDownloading object has been set!",
                    DebugSourceType = 2,
                    DebugType = 3
                });
            }

            if (args.DownloadStatus == "COMPLETED")
            {
                CurrentlyDownloading = new JsonDownloadInfo();
            }

            
        }

        private async Task DownloadQueueHandler()
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "DownloadQueueHandler Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 3,
                DebugType = 0
            });

            int retries = 0;
            while (!Stop) {

                if (DownloadQueue.Count > 0)
                {
                    JsonDownloadInfo toDownload = DownloadQueue[0];
                    if (retries > 2)
                    {
                        CurrentlyDownloading = null;
                        IsDownloading = false;
                        DownloadQueue.RemoveAt(0);
                        retries = 0;
                        OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                        {
                            DebugMessage = "Could not start download after 3 tries :(, removing download from queue. ",
                            DebugSource = this.GetType().Name,
                            DebugSourceType = 3,
                            DebugType = 3
                        });
                    }
                    else
                    {
                        if (!IrcClientHandler.IsDownloading())
                        {
                            IsDownloading = false;
                            Thread.Sleep(500);
                            IrcClientHandler.StartDownload(toDownload);
                            int timeOutCount = 0;
                            bool timedOut = true;

                            while (timeOutCount < 3000)
                            {
                                if (IrcClientHandler.IsDownloading())
                                {
                                    timedOut = false;
                                    break;
                                }
                                Thread.Sleep(1000);
                            }

                            if (!timedOut)
                            {

                                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                                {
                                    DebugMessage = "Download succesfully initiated, wait for irc download event to be sure.",
                                    DebugSource = this.GetType().Name,
                                    DebugSourceType = 3,
                                    DebugType = 2
                                });

                                CurrentlyDownloading = toDownload;
                                IsDownloading = true;
                                DownloadQueue.RemoveAt(0);
                            }
                            else
                            {

                                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                                {
                                    DebugMessage = "Could not start download :(, retrying.  ",
                                    DebugSource = this.GetType().Name,
                                    DebugSourceType = 3,
                                    DebugType = 3
                                });
                                retries++;
                            }
                        }
                    }                    
                }
            }            
        }

        public void SetIrcSettings(IrcSettings settings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "SetIrcSettings Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            IrcSettings = settings;
        }

        public void SetLittleWeebSettings(LittleWeebSettings settings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "SetLittleWeebSettings Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
        }
    }
}
