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

        public int port { get; set; }
        public bool local { get; set; } 
        public string version { get; set; } 
        public int randomusernamelength { get; set; } 
        public int maxdebuglogsize { get; set; }
        public string type = "settings";
        public List<int> debuglevel { get; set; }


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
