using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Models;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Handlers
{
    public interface IDirectoryHandler
    {

    }
    public class DirectoryHandler : IDebugEvent, IDirectoryHandler
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private readonly ISettingsHandler SettingsHandler;
        private readonly IIrcClientHandler IrcClientHandler;
        private readonly IWebSocketHandler WebSocketHandler;

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
        
        public void GetDrives()
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "GetDrives Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });

            try
            {
                string test = Android.OS.Environment.RootDirectory.AbsolutePath;
                JsonDirectories directories = new JsonDirectories();
#if __ANDROID__
                JsonDirectory directory = new JsonDirectory();
                directory.path = Android.OS.Environment.ExternalStorageDirectory.AbsolutePath;
                directory.dirname = "External Storage if Present.";

                directories.directories.Add(directory);            

                directory = new JsonDirectory();
                directory.path = Android.OS.Environment.RootDirectory.AbsolutePath;
                directory.dirname = "Internal Root Directory";

                directories.directories.Add(directory);
#else
                DriveInfo[] allDrives = DriveInfo.GetDrives();
                foreach (DriveInfo drive in allDrives)
                {
                    JsonDirectory directorywithpath = new JsonDirectory();
                    directorywithpath.dirname = drive.Name;
                    directorywithpath.path = drive.Name;
                    directories.directories.Add(directorywithpath);
                }
#endif
                WebSocketHandler.SendMessage(directories.ToJson());
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
                error.type = "get_drives_error";
                error.errortype = "exception";
                error.errormessage = "Could not get drives, see log.";
            
                WebSocketHandler.SendMessage(error.ToJson());
            }
            
        }

        public void GetDirectories(string path)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "GetDirectories Called.",
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
                string[] dirs = Directory.GetDirectories(path);
                
                JsonDirectories tosendover = new JsonDirectories();
                List<JsonDirectory> directorieswithpath = new List<JsonDirectory>();
                foreach (string directory in dirs)
                {
                    JsonDirectory directorywithpath = new JsonDirectory();
                    directorywithpath.dirname = directory.Replace(Path.GetDirectoryName(directory) + Path.DirectorySeparatorChar, "");
                    directorywithpath.path = directory;
                    tosendover.directories.Add(directorywithpath);
                }
                WebSocketHandler.SendMessage(tosendover.ToJson());


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
                error.type = "get_drives_error";
                error.errortype = "exception";
                error.errormessage = "Could not get drives, see log.";

                WebSocketHandler.SendMessage(error.ToJson());
            }
        }

        public void DeleteDirectory(string path)
        {
            try
            {
                DirectoryInfo info = new DirectoryInfo(path);
                int amountOfFiles = info.GetFiles().Length;
                if (amountOfFiles == 0)
                {
                    Directory.Delete(path);

                    JsonSuccesReport report = new JsonSuccesReport()
                    {
                        message = "Succesfully deleted folder with path: " + path
                    };

                    WebSocketHandler.SendMessage(report.ToJson());

                }
                else
                {
                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugMessage = "Could not delete directory: " + path + " because there are still files and/or other directories inside!",
                        DebugSource = this.GetType().Name,
                        DebugSourceType = 1,
                        DebugType = 3
                    });

                    JsonError error = new JsonError();
                    error.type = "delete_directory_warning";
                    error.errortype = "warning";
                    error.errormessage = "Could not delete directory: " + path + " because there are still files and/or other directories inside!";

                    WebSocketHandler.SendMessage(error.ToJson());
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

                JsonError error = new JsonError();
                error.type = "delete_directory_error";
                error.errortype = "exception";
                error.errormessage = "Could not get drives, see log.";

                WebSocketHandler.SendMessage(error.ToJson());
            }
        }

        public void CreateDirectory(string path, string name)
        {

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "CreateDirectory Called.",
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

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = name,
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);

                    GetDirectories(path);
                }
                else
                {
                    JsonError err = new JsonError();
                    err.type = "creating_directory_path_already_exists";

                    OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                    {
                        DebugMessage = "Directory already exists!",
                        DebugSource = this.GetType().Name,
                        DebugSourceType = 1,
                        DebugType = 3
                    });

                    JsonError error = new JsonError();
                    error.type = "directory_already_exists";
                    error.errortype = "warning";
                    error.errormessage = "Directory already exist.";

                    WebSocketHandler.SendMessage(error.ToJson());
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

                JsonError error = new JsonError();
                error.type = "create_directory_error";
                error.errortype = "exception";
                error.errormessage = "Could not  create directory, see log.";

                WebSocketHandler.SendMessage(error.ToJson());

            }
        }

        
        public void OpenDirectory(string directoryPath)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = "OpenDirectory Called.",
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugMessage = directoryPath,
                DebugSource = this.GetType().Name,
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {

#if __ANDROID__
                Android.Net.Uri uri = Android.Net.Uri.Parse(directoryPath);
                Intent intent = new Intent(Intent.ActionView);
                intent.SetDataAndType(uri, "file/*");
                intent.SetFlags(ActivityFlags.ClearWhenTaskReset | ActivityFlags.NewTask);
                Android.App.Application.Context.StartActivity(Intent.CreateChooser(intent, "Choose File Explorer"));
#else
                Process.Start(directoryPath);


                JsonSuccesReport report = new JsonSuccesReport()
                {
                    message = "Succesfully opened folder with path: " + directoryPath
                };

                WebSocketHandler.SendMessage(report.ToJson());
#endif
            }
            catch (Exception e)
            {
                JsonError err = new JsonError();
                err.type = "open_directory_failed";
                err.errormessage = "Could not open directory.";
                err.errortype = "exception";

                WebSocketHandler.SendMessage(err.ToJson());

                OnDebugEvent?.Invoke(this, new BaseDebugArgs()
                {
                    DebugMessage = e.ToString(),
                    DebugSource = this.GetType().Name,
                    DebugSourceType = 1,
                    DebugType = 4
                });

            }
        }
    }
}
