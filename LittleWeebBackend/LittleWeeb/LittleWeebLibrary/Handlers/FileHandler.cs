﻿using Android.Content;
using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LittleWeebLibrary.Handlers
{
    public interface IFileHandler
    {
        event EventHandler<FileHandlerDebugEventArgs> OnFileHandlerDebugEvent;
        Task<string> OpenFile(string filePath, string fileName = null);
        string DeleteFile(string filePath, string fileName = null);
    }
    public class FileHandler : IFileHandler, IDebugEvent, ISettingsInterface
    {
        public event EventHandler<FileHandlerDebugEventArgs> OnFileHandlerDebugEvent;
        public event EventHandler<BaseDebugArgs> OnDebugEvent;


        private LittleWeebSettings LittleWeebSettings;

        public async Task<string> OpenFile(string filePath, string fileName = null)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "OpenFile Called.",
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

            string fullFilePath = filePath;

            if (fileName != null)
            {

                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugMessage = fileName,
                    DebugSource = this.GetType().Name,
                    DebugSourceType = 1,
                    DebugType = 1
                });

                fullFilePath = Path.Combine(filePath, fileName);
            }

            try
            {
                
                for (int i = 0; i < 5; i++)
                {

                    if (File.Exists(fullFilePath))
                    {
#if __ANDROID__

                        Android.Net.Uri uri = Android.Net.Uri.Parse(fullFilePath);
                        Intent intent = new Intent(Intent.ActionView);
                        intent.SetDataAndType(uri, "video/*");
                        intent.SetFlags(ActivityFlags.ClearWhenTaskReset | ActivityFlags.NewTask);
                        Android.App.Application.Context.StartActivity(intent);
#else
                        Task.Run(() => Process.Start(fullFilePath));
#endif
                        JsonSuccesReport report = new JsonSuccesReport()
                        {
                            message = "Succesfully opened file with path: " + fullFilePath
                        };

                        return report.ToJson();
                    }
                    Thread.Sleep(1000);
                }

                JsonError err = new JsonError();
                err.type = "open_file_failed";
                err.errormessage = "Could not open file but didn't throw exception.";
                err.errortype = "warning";
                return err.ToJson();

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


                JsonError err = new JsonError();
                err.type = "open_file_failed";
                err.errormessage = "Could not open file.";
                err.errortype = "exception";

                return err.ToJson();
            }
        }
       

        public string DeleteFile(string filePath, string fileName = null)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "DeleteFile Called.",
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

            string fullFilePath = filePath;

            if (fileName != null)
            {

                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugMessage = fileName,
                    DebugSource = this.GetType().Name,
                    DebugSourceType = 1,
                    DebugType = 1
                });

                fullFilePath = Path.Combine(filePath, fileName);
            }

            try
            {
                // Trace.WriteLine("Trace-WEBSOCKETHANDLER: YOU MORON... no actually, THIS SHOULD ONLY HAPPEN... well.. when you actually want to delete stuff x)");
                File.Delete(fullFilePath);

                string[] filePaths = Directory.GetFiles(Path.GetDirectoryName(filePath));
                if (filePaths.Length == 0)
                {
                    Directory.Delete(filePath);

                    JsonSuccesReport report = new JsonSuccesReport()
                    {
                        message = "Succesfully deleted file with path: " + fullFilePath + " and directory: " + filePath
                    };

                    return report.ToJson();
                }
                else
                {

                    JsonSuccesReport report = new JsonSuccesReport()
                    {
                        message = "Succesfully deleted file with path: " + fullFilePath
                    };

                    return report.ToJson();
                }


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


                JsonError err = new JsonError();
                err.type = "delete_file_failed";
                err.errormessage = "Could not delete file.";
                err.errortype = "exception";

                return err.ToJson();
            }
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
