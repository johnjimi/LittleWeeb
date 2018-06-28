using LittleWeebLibrary.EventArguments;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Settings;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Handlers
{

    public interface IDebugHandler
    {
        void UpdateDebugEvents(List<IDebugEvent> debugEvents);
    }

    public class DebugHandler : IDebugHandler, ISettingsInterface
    {
        private readonly List<string> currentLog;

        private bool DebugWriteAble = false;
        private string DebugFileName = "littleweeb_debug_log.log";
        private string DebugPath = "";
        private string[] DebugTypes = new string[] { "ENTRY/EXIT", "PARAMETERS", "INFO", "WARNING", "ERROR", "SEVERE" };
        private string[] DebugSourceTypes = new string[] { "CONSTRUCTOR", "METHOD", "EVENT", "TASK", "EXTERNAL(LIBRARY)" };
        private LittleWeebSettings LittleWeebSettings;


        public DebugHandler(LittleWeebSettings settings, List<IDebugEvent> debugEvents)
        {

            LittleWeebSettings = settings;
            currentLog = new List<string>();
            foreach (IDebugEvent debugEvent in debugEvents)
            {
                debugEvent.OnDebugEvent += OnDebugEvent;
            }

        }

        public void UpdateDebugEvents(List<IDebugEvent> debugEvents)
        {
            foreach (IDebugEvent debugEvent in debugEvents)
            {
                debugEvent.OnDebugEvent += OnDebugEvent;
            }
        }

        public void SetIrcSettings(IrcSettings settings)
        {
            throw new NotImplementedException();
        }

        public void SetLittleWeebSettings(LittleWeebSettings settings)
        {
            LittleWeebSettings = settings;
        }

        private void OnDebugEvent(object sender, BaseDebugArgs args)
        {
            CreateFile();
            DebugFileWriter(args.DebugMessage, args.DebugSource, args.DebugSourceType, args.DebugType);
        }


        private void CreateFile()
        {
            try
            {

#if __ANDROID__
                DebugPath = Path.Combine(Path.Combine(Environment.GetFolderPath(Android.OS.Environment.ExternalStorageDirectory.AbsolutePath), "LittleWeeb"), "DebugLog");
#else
                DebugPath = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LittleWeeb"), "DebugLog");
#endif
                if (!File.Exists(Path.Combine(DebugPath, DebugFileName)))
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, DebugFileName), true))
                    {
                        streamWriter.WriteLine("Starting Log AT: " + DateTime.UtcNow);
                    }
                }
                if (File.Exists(Path.Combine(DebugPath, DebugFileName)))
                {
                    using (var streamReader = new StreamReader(Path.Combine(DebugPath, DebugFileName)))
                    {
                        string readLine = "";
                        while ((readLine = streamReader.ReadLine()) != null)
                        {
                            currentLog.Add(readLine);
                        }
                    }
                    DebugWriteAble = true;
                }
            }
            catch (Exception e)
            {
                DebugWriteAble = false;
#if DEBUG
                Debug.WriteLine(e.ToString());
#endif
            }
        }

        private void DebugFileWriter(string toWrite, string source, int sourceType, int debugType)
        {
            if (DebugWriteAble && LittleWeebSettings.DebugLevel.Contains(debugType))
            {
                string debugSourceType = "";

                if (sourceType == 99)
                {
                    debugSourceType = "UNDEFINED";
                }
                else
                {
                    debugSourceType = DebugSourceTypes[sourceType];
                }

                string toWriteString = DebugTypes[debugType] + "|" + source + "|" + debugSourceType + "|" + toWrite + "|" + DateTime.UtcNow.ToShortTimeString();
                if (currentLog.Count > LittleWeebSettings.MaxDebugLogSize)
                {

                    currentLog.RemoveAt(0);
                    string fullLog = "";
                    foreach (string line in currentLog)
                    {
                        fullLog += line + Environment.NewLine;
                    }

                    fullLog += toWriteString;

                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, DebugFileName), false))
                    {
                        currentLog.Add(toWriteString);
                        streamWriter.WriteLine(fullLog);
                    }
                }
                else
                {
                    using (var streamWriter = new StreamWriter(Path.Combine(DebugPath, DebugFileName), true))
                    {
                        currentLog.Add(toWriteString);
                        streamWriter.WriteLine(toWriteString);
                    }
                }
            }            
        }

      
    }
}
