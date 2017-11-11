using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LittleWeeb
{
    class JsonIrcUpdate
    {
        public string type = "irc_data";
        public bool connected { get; set; }
        public string channel { get; set; }
        public string server { get; set; }
        public string user { get; set; }
        public string downloadlocation { get; set; }
    }
}
