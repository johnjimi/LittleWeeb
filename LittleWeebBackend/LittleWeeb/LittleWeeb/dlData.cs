namespace LittleWeeb
{
    class dlData
    {
        public string dlId { get; set; }
        public string dlBot { get; set; }
        public string dlPack { get; set; }

        public dlData()
        {
            //nadanoppes
        }

        public dlData(string dlId, string dlBot, string dlPack)
        {
            this.dlBot = dlBot;
            this.dlId = dlId;
            this.dlPack = dlPack;
        }
    }
}
