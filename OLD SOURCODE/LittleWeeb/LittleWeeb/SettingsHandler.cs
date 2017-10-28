using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Threading.Tasks;

namespace LittleWeeb
{
    class SettingsHandler
    {
        private SharedData shared;
        public SettingsHandler(SharedData shared)
        {
            this.shared = shared;
        }

        public void saveSettings()
        {
            try
            {
                Settings setting = new Settings();
                setting.downloaddir = shared.currentDownloadLocation;
                IFormatter formatter = new BinaryFormatter();
                string settingsFile = "LittleWeebSettings.bin";
                Stream stream = new FileStream(settingsFile, FileMode.Create, FileAccess.Write, FileShare.None);
                formatter.Serialize(stream, setting);
                stream.Close();
            }
            catch (Exception e)
            {
                Debug.WriteLine("DEBUG: COULD NOT SAVE SETTINGS -> " + e.ToString());
            }

        }

        public void loadSettings()
        {
            try
            {
                IFormatter formatter = new BinaryFormatter();

                string settingsFile = "LittleWeebSettings.bin";
                if (!File.Exists(settingsFile))
                {
                    File.Create(settingsFile);
                }
                else
                {

                    Stream stream = new FileStream(settingsFile, FileMode.Open, FileAccess.Read, FileShare.Read);
                    Settings setting = (Settings)formatter.Deserialize(stream);
                    stream.Close();
                    shared.currentDownloadLocation = setting.downloaddir;
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine("DEBUG: COULD NOT OPEN SETTINGS -> " + e.ToString());
            }

        }
    }
}
