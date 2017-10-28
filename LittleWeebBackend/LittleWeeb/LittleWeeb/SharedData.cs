using SimpleIRCLib;
using System.Collections.Concurrent;

namespace LittleWeeb
{
    class SharedData
    {
        public bool joinedChannel { get; set; }
        public bool closeBackend { get; set; }
        public bool currentlyDownloading { get; set; }
        public string currentDownloadLocation { get; set; }
        public string currentDownloadId { get; set; }
        public ConcurrentBag<dlData> downloadList { get; set; }
        public SimpleIRC irc { get; set; }
        public SimpleWebSockets websocketserver { get; set; }
        public SettingsHandler settings { get; set; }
    }
}
