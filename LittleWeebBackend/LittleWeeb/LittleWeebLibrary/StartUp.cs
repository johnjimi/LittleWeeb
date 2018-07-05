﻿using LittleWeebLibrary.Controllers;
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
            DebugHandler =          new DebugHandler(SettingsHandler);

            //Services
            DirectoryWebSocketService = new DirectoryWebSocketService(WebSocketHandler, DirectoryHandler);
            DownloadWebSocketService =  new DownloadWebSocketService(WebSocketHandler, DirectoryHandler, DownloadHandler, FileHandler, FileHistoryHandler, SettingsHandler);
            FileWebSocketService =      new FileWebSocketService(WebSocketHandler, FileHandler, FileHistoryHandler, DownloadHandler);
            IrcWebSocketService =       new IrcWebSocketService(WebSocketHandler, IrcClientHandler, SettingsHandler);
            SettingsWebSocketService =  new SettingsWebSocketService(WebSocketHandler, DirectoryHandler);


            //Controllers
            DirectoryWebSocketController =  new DirectoryWebSocketController(WebSocketHandler, DirectoryWebSocketService);
            DownloadWebSocketController =   new DownloadWebSocketController(WebSocketHandler, DownloadWebSocketService, DirectoryWebSocketService);
            FileWebSocketController =       new FileWebSocketController(WebSocketHandler, FileWebSocketService);
            IrcWebSocketController =        new IrcWebSocketController(WebSocketHandler, IrcWebSocketService);
            SettingsWebSocketController =   new SettingsWebSocketController(WebSocketHandler, SettingsWebSocketService);

            IBaseWebSocketController baseWebSocketController = new BaseWebSocketController(WebSocketHandler);
            //start debugh handler registering all the handlers, services and controllers as IDebugEvent interface.

            SettingsWebSocketService.SetSettingsClasses(
                WebSocketHandler,
                SettingsHandler,
                IrcClientHandler,
                DebugHandler,
                FileHandler,
                DownloadHandler,
                DirectoryWebSocketService,
                IrcWebSocketService
            );

            baseWebSocketController.SetSubControllers(new List<ISubWebSocketController>()
            {
                DirectoryWebSocketController,
                DownloadWebSocketController,
                FileWebSocketController,
                IrcWebSocketController,
                SettingsWebSocketController
            });

            DebugHandler.SetDebugEvents(new List<IDebugEvent>()
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

        }

        public void Start()
        {
            Console.WriteLine("IM DESPERATE, STARTIN WEBSOCKET SERVER!");
            WebSocketHandler.StartServer();
        }

        public void Stop()
        {
            Console.WriteLine("IM DESPERATE, STOPPING EVERYTHING!");
            WebSocketHandler.StopServer();
            IrcClientHandler.StopConnection();
            DownloadHandler.StopQueue();           
        }
    }
}
