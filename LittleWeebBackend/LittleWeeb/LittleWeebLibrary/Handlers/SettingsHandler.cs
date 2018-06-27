using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Settings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Handlers
{
    public interface ISettingsHandler
    {
        IrcSettings GetIrcSettings();
        LittleWeebSettings GetLittleWeebSettings();
        void WriteIrcSettings(IrcSettings ircSettings);
        void WriteLittleWeebSettings(LittleWeebSettings littleWeebSettings);
    }

    public class SettingsHandler : ISettingsHandler, IDebugEvent
    {
        public event EventHandler<BaseDebugArgs> OnDebugEvent;

        private string DebugPath;

        public void WriteIrcSettings(IrcSettings ircSettings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "WriteIrcSettings called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = ircSettings.ToString(),
                DebugSourceType = 1,
                DebugType = 1
            });

            try
            {
                string settingsName = "IrcSettings.json";
                string settingsJson = JsonConvert.SerializeObject(ircSettings);
#if __ANDROID__
                DebugPath = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.ExternalStorageDirectory), "LittleWeeb"), "Settings");
                if (!File.Exists(Path.Combine(DebugPath, "settingsName")))
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), true))
                    {
                        streamWriter.Write(settingsJson);
                    }
                } else {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), false))
                    {
                        streamWriter.Write(settingsJson);
                    }
                }
#else
                DebugPath = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LittleWeeb"), "Settings");
                if (!File.Exists(Path.Combine(DebugPath, settingsName)))
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), true))
                    {
                        streamWriter.Write(settingsJson);
                    }
                }
                else
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), false))
                    {
                        streamWriter.Write(settingsJson);
                    }
                }
#endif

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

        public void WriteLittleWeebSettings(LittleWeebSettings littleWeebSettings)
        {
            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = "WriteLittleWeebSettings called.",
                DebugSourceType = 1,
                DebugType = 0
            });

            OnDebugEvent?.Invoke(this, new BaseDebugArgs()
            {
                DebugSource = this.GetType().Name,
                DebugMessage = littleWeebSettings.ToString(),
                DebugSourceType = 1,
                DebugType = 1
            });



            try
            {
                string settingsName = "LittleWeebSettings.json";
                string settingsJson = JsonConvert.SerializeObject(littleWeebSettings);
#if __ANDROID__
                DebugPath = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.ExternalStorageDirectory), "LittleWeeb"), "Settings");
                if (!File.Exists(Path.Combine(DebugPath, "settingsName")))
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), true))
                    {
                        streamWriter.Write(settingsJson);
                    }
                } else {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), false))
                    {
                        streamWriter.Write(settingsJson);
                    }
                }
#else
                DebugPath = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LittleWeeb"), "Settings");
                if (!File.Exists(Path.Combine(DebugPath, settingsName)))
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), true))
                    {
                        streamWriter.Write(settingsJson);
                    }
                }
                else
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, settingsName), false))
                    {
                        streamWriter.Write(settingsJson);
                    }
                }
#endif

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

        public LittleWeebSettings GetLittleWeebSettings()
        {
            LittleWeebSettings toReturn = new LittleWeebSettings();

            try
            {
                string settingsName = "LittleWeebSettings.json";
                if (File.Exists(Path.Combine(DebugPath, settingsName)))
                {
                    string settingsJson = "";
                    using (var streamReader = new StreamReader(Path.Combine(DebugPath, settingsName)))
                    {
                        string readLine = "";
                        while ((readLine = streamReader.ReadLine()) != null)
                        {
                            settingsJson += readLine;
                        }
                    }

                    toReturn = JsonConvert.DeserializeObject<LittleWeebSettings>(settingsJson);
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

            return toReturn;
        }

        public IrcSettings GetIrcSettings()
        {
            IrcSettings toReturn = new IrcSettings();

            try
            {
                string settingsName = "IrcSettings.json";
                if (File.Exists(Path.Combine(DebugPath, settingsName)))
                {
                    string settingsJson = "";
                    using (var streamReader = new StreamReader(Path.Combine(DebugPath, settingsName)))
                    {
                        string readLine = "";
                        while ((readLine = streamReader.ReadLine()) != null)
                        {
                            settingsJson += readLine;
                        }
                    }

                    toReturn = JsonConvert.DeserializeObject<IrcSettings>(settingsJson);
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

            return toReturn;
        }

    }
}
