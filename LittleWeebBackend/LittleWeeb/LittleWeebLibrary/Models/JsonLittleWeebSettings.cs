using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace LittleWeebLibrary.Models
{
    public class JsonLittleWeebSettings
    {

        public int port { get; set; } = 1515;
        public bool local { get; set; } = true;
        public string version { get; set; } = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
        public int randomusernamelength { get; set; } = 6;
        public int maxdebuglogsize { get; set; } = 10000;
        public string type = "settings";
        public List<int> debuglevel { get; set; } = new List<int>() { 0, 1, 2, 3, 4, 5 };
#if __ANDROID__
        public string basedownloaddir  {get;set;}=  Path.Combine(Path.Combine(Environment.GetFolderPath(Android.OS.Environment.ExternalStorageDirectory.AbsolutePath), "LittleWeeb"), "Downloads");
#else
        public string basedownloaddir { get; set; } = Path.Combine(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "LittleWeeb"), "Downloads");
#endif


        public string ToJson()
        {
            return JsonConvert.SerializeObject(this);
        }
        public override string ToString()
        {
            JObject jobject = JObject.FromObject(this);
            string properties = string.Empty;
            foreach (var x in jobject)
            {
                properties += x.Key + ": " + x.Value.ToString();
            }
            return properties;
        }
    }
}
