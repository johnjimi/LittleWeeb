using SimpleIRCLib;
using System.Collections.Concurrent;
using WebSocketSharp.Server;

namespace LittleWeeb
{
    class SharedData
    {
        public static bool joinedChannel { get; set; }
        public static bool closeBackend { get; set; }
        public static bool currentlyDownloading { get; set; }
        public static string currentDownloadLocation { get; set; }
        public static string currentDownloadId { get; set; }
        public static ConcurrentBag<dlData> downloadList { get; set; }
        public static SimpleIRC irc { get; set; }
        public static WebSocketServer websocketserver { get; set; }
        public static SettingsHandler settings { get; set; }
        public static ConcurrentBag<string> messageToSendWS { get; set; }
    }
}
