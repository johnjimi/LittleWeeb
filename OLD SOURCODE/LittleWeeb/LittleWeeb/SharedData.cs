using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SimpleIRCLib;
namespace LittleWeeb
{
    class SharedData
    {
        public bool joinedChannel { get; set; }
        public bool closeBackend { get; set; }
        public bool currentlyDownloading { get; set; }
        public string currentDownloadLocation { get; set; }
        public string currentDownloadId { get; set; }
        public List<dlData> downloadList { get; set; }
        public SimpleIRC irc { get; set; }
        public SimpleWebSockets websocketserver { get; set; }
        public SettingsHandler settings { get; set; }
    }
}
