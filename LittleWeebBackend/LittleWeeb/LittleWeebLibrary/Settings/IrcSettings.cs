using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary.Settings
{
    public class IrcSettings
    {
        public string ServerAddress { get; set; } = "irc.rizon.net";
        public int Port { get; set; } = 6669;
        public bool Secure { get; set; } = true;
        public string Channels { get; set; } = "#nibl,#horriblesubs,#news";
        public string UserName { get; set; } = string.Empty;
        public string DownloadDirectory { get; set; } = string.Empty;

        public override string ToString()
        {
            string toReturn = string.Empty;
            toReturn += "ServerAddress: " + ServerAddress + Environment.NewLine;
            toReturn += "Port: " + Port.ToString() + Environment.NewLine;
            toReturn += "Secure: " + Secure.ToString() + Environment.NewLine;
            toReturn += "Channels: " + Channels.ToString() + Environment.NewLine;
            toReturn += "UserName: " + UserName + Environment.NewLine;
            toReturn += "DownloadDirectory: " + DownloadDirectory + Environment.NewLine;
            return toReturn;
        }
    }
}
