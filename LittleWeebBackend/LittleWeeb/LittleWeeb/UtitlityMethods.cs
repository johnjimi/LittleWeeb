using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace LittleWeeb
{
    class UtitlityMethods
    {
        public UtitlityMethods()
        {

        }

        public string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("Local IP Address Not Found!");
        }

        public string GetValidFileName(string fileName)
        {
            // remove any invalid character from the filename.
            String ret = Regex.Replace(fileName.Trim(), "[^A-Za-z0-9_. ]+", "");
            return ret.Replace(" ", String.Empty);
        }


        private Random random = new Random();
        public string RandomString(int length)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public void InvokeIfRequired(Control control, MethodInvoker action)
        {

            if (control.InvokeRequired)
            {
                control.Invoke(action);
            }
            else
            {
                action();
            }
        }

        public bool IsMediaFile(string filename)
        {
            string[] fileExtensions = new string[] { ".mkv", ".mp4", ".avi", ".flak", ".mp3", ".aac", ".exe", ".tar", ".aaf", ".3gp", ".asf", ".avchd", ".avi", ".bik", ".dat", ".flv", ".mpeg", ".m4v", ".mkv", ".mp4", ".mts", ".wmv", ".vp9", ".vp8", ".webm" };
            string extension = Path.GetExtension(filename.ToLower());

            int inArray = Array.IndexOf(fileExtensions, extension);
            if (inArray > -1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
