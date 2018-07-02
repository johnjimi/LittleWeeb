using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Models
{
    public class JsonDownloadInfo
    {
        public string type = "download_update"; //used for identifying json
        public JsonAnimeInfo animeInfo { get; set; }
        public string id { get; set; }
        public string episodeNumber { get; set; }
        public string bot { get; set; }
        public string pack { get; set; }
        public string progress { get; set; }
        public string speed { get; set; }
        public string status { get; set; }
        public string filename { get; set; }
        public string filesize { get; set; }
        public int downloadIndex { get; set; }
        public string downloadDirectory { get; set; }

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
