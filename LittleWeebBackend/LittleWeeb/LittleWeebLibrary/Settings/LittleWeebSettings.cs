using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Settings
{
    public class LittleWeebSettings
    {
        public int Port { get; set; } = 1515;
        public bool Local { get; set; } = true;
        public string Version { get; set; } = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
        public int RandomUsernameLength { get; set; } = 6;
        public List<int> DebugLevel { get; set; } = new List<int>() { 0, 1, 2, 3, 4, 5 };
        public int MaxDebugLogSize { get; set; } = 10000;
#if __ANDROID__
        public string BaseDownloadDir  {get;set;}=  Path.Combine(Path.Combine(Environment.GetFolderPath(Android.OS.Environment.ExternalStorageDirectory.AbsolutePath), "LittleWeeb"), "Downloads");
#else
        public string BaseDownloadDir { get; set; } = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LittleWeeb"), "Downloads");
#endif


        public override string ToString()
        {
            string toReturn = string.Empty;
            toReturn += "Port: " + Port.ToString() + Environment.NewLine;
            toReturn += "Local: " + Local.ToString() + Environment.NewLine;
            toReturn += "Version: " + Version + Environment.NewLine;
            toReturn += "RandomUserNameLength:: " + RandomUsernameLength.ToString() + Environment.NewLine;
            toReturn += "DebugLevel: ";
            foreach (int debugLevel in DebugLevel) {
                toReturn += debugLevel.ToString() + ",";
            }
            toReturn += Environment.NewLine;
            toReturn += "MaxDebugLogSize: " + MaxDebugLogSize.ToString() + Environment.NewLine;

            return toReturn;
        }
    }
}
