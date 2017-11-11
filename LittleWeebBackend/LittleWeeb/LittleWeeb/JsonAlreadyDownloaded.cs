using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LittleWeeb
{
    class JsonAlreadyDownloaded
    {
        public string type = "already_downloaded"; //used for identifying json
        public List<JsonDownloadUpdate> alreadyDownloaded { get; set; }
    }

}
