using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LittleWeeb
{
    class JsonDownloadUpdate
    {
        public string type = "download_update"; //used for identifying json
        public string id { get; set; }
        public string progress { get; set; }
        public string speed { get; set; }
        public string status { get; set; }
        public string filename { get; set; }
        public string filesize { get; set; }

    }
}
