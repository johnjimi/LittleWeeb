using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Models
{
    class Jsonfullfilepath
    {
        public string type = "downloaded_files"; //used for identifying json
        public string directory = "/";

        public JsonAnimeInfo animeinfo { get; set; }
        public List<JsonDownloadInfo> alreadyDownloaded { get; set; }

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
