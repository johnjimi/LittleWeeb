using LittleWeebLibrary.Controllers;
using LittleWeebLibrary.Controllers.SubControllers;
using LittleWeebLibrary.GlobalInterfaces;
using LittleWeebLibrary.Handlers;
using LittleWeebLibrary.Services;
using System;
using System.Collections.Generic;
using System.Text;

namespace LittleWeebLibrary
{
    public class StartUp
    {

        //handlers
        private readonly ISettingsHandler SettingsHandler;
        private readonly IWebSocketHandler WebSocketHandler;
        private readonly IFileHistoryHandler FileHistoryHandler;
        private readonly IFileHandler FileHandler;
        private readonly IDirectoryHandler DirectoryHandler;
        private readonly IIrcClientHandler IrcClientHandler;
        private readonly IDownloadHandler DownloadHandler;
        private readonly IDebugHandler DebugHandler;

        //services
        private readonly IDirectoryWebSocketService DirectoryWebSocketService;
        private readonly IDownloadWebSocketService DownloadWebSocketService;
        private readonly IFileWebSocketService FileWebSocketService;
        private readonly IIrcWebSocketService IrcWebSocketService;
        private readonly ISettingsWebSocketService SettingsWebSocketService;

        //controllers
        private readonly ISubWebSocketController DirectoryWebSocketController;
        private readonly ISubWebSocketController DownloadWebSocketController;
        private readonly ISubWebSocketController FileWebSocketController;
        private readonly ISubWebSocketController IrcWebSocketController;
        private readonly ISubWebSocketController SettingsWebSocketController;

        public StartUp()
        {
            //handlers

            SettingsHandler =       new SettingsHandler();
            FileHistoryHandler =    new FileHistoryHandler();
            FileHandler =           new FileHandler();
            DirectoryHandler =      new DirectoryHandler();
            WebSocketHandler =      new WebSocketHandler(SettingsHandler);
            IrcClientHandler =      new IrcClientHandler(SettingsHandler);
            DownloadHandler =       new DownloadHandler(IrcClientHandler);
            
            //Services
            DirectoryWebSocketService = new DirectoryWebSocketService(WebSocketHandler, DirectoryHandler);
            DownloadWebSocketService =  new DownloadWebSocketService(WebSocketHandler, DirectoryHandler, DownloadHandler, FileHistoryHandler, SettingsHandler);
            FileWebSocketService =      new FileWebSocketService(WebSocketHandler, FileHandler, FileHistoryHandler, DownloadHandler);
            IrcWebSocketService =       new IrcWebSocketService(WebSocketHandler, IrcClientHandler, SettingsHandler);


            //Controllers
            DirectoryWebSocketController = new DirectoryWebSocketController(WebSocketHandler, DirectoryWebSocketService);
            DownloadWebSocketController = new DownloadWebSocketController(WebSocketHandler, DownloadWebSocketService, DirectoryWebSocketService);
            FileWebSocketController = new FileWebSocketController(WebSocketHandler, FileWebSocketService);
            IrcWebSocketController = new IrcWebSocketController(WebSocketHandler, IrcWebSocketService);
            SettingsWebSocketController = new SettingsWebSocketController(WebSocketHandler, SettingsWebSocketService);

            IBaseWebSocketController baseWebSocketController = new BaseWebSocketController(new List<ISubWebSocketController>()
            {
                DirectoryWebSocketController,
                DownloadWebSocketController,
                FileWebSocketController,
                IrcWebSocketController,
                SettingsWebSocketController
            }, WebSocketHandler);

           

            //start debugh handler registering all the handlers, services and controllers as IDebugEvent interface.
            DebugHandler = new DebugHandler(SettingsHandler, new List<IDebugEvent>()
            {
                SettingsHandler as IDebugEvent,
                WebSocketHandler as IDebugEvent,
                FileHistoryHandler as IDebugEvent,
                FileHandler as IDebugEvent,
                DirectoryHandler as IDebugEvent,
                IrcClientHandler as IDebugEvent,
                DownloadHandler as IDebugEvent,
                DirectoryWebSocketService as IDebugEvent,
                DownloadWebSocketService as IDebugEvent,
                FileWebSocketService as IDebugEvent,
                IrcWebSocketService as IDebugEvent,
                SettingsWebSocketService as IDebugEvent,
                DirectoryWebSocketController as IDebugEvent,
                DownloadWebSocketController as IDebugEvent,
                FileWebSocketController as IDebugEvent,
                IrcWebSocketController as IDebugEvent,
                SettingsWebSocketController as IDebugEvent,
                baseWebSocketController as IDebugEvent

            });

            //special service for settings (needs to be initialized after all other handlers, services and controllers are intialized (except for the debug handler...? TODO: Possibly request feedback on how to do this differently.)
            SettingsWebSocketService = new SettingsWebSocketService(
                WebSocketHandler,
                SettingsHandler,
                IrcClientHandler,
                DebugHandler,
                FileHandler,
                DirectoryHandler,
                DownloadHandler,
                DirectoryWebSocketService,
                IrcWebSocketService
            );
        }

        public void Start()
        {
            WebSocketHandler.StartServer();
        }

        public void Stop()
        {
            WebSocketHandler.StopServer();
            IrcClientHandler.StopConnection();
            DownloadHandler.StopQueue();           
        }
    }
}
