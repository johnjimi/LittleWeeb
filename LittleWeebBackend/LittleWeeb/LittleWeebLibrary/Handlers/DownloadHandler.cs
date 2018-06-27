using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LittleWeebLibrary.Handlers
{
    public interface IDownloadHandler
    {
        event EventHandler<DownloadUpdateEventArgs> OnDownloadUpdateEvent;
        void AddDownload(JsonDownloadInfo download);
        void RemoveDownload(JsonDownloadInfo download);
        JsonDownloadInfo GetCurrentlyDownloading();
        void StopQueue();
    }

    public class DownloadHandler : IDownloadHandler, IDebugEvent
    {
        public event EventHandler<DownloadUpdateEventArgs> OnDownloadUpdateEvent;
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private List<JsonDownloadInfo> DownloadQueue;
        private IIrcClientHandler IrcClientHandler;
        private bool Stop;
        private bool IsDownloading;
        private JsonDownloadInfo CurrentlyDownloading;

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

        public void AddDownload(JsonDownloadInfo download)
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
                DownloadQueue.Add(download);
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

        public void RemoveDownload(JsonDownloadInfo download)
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

        public void StopQueue() {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "StopQueue Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });
            Stop = true;
        }

        public JsonDownloadInfo GetCurrentlyDownloading()
        {
            return CurrentlyDownloading;
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
                    animeid = CurrentlyDownloading.animeid,
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
    }
}
