import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';
import {ShareService} from './share.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

/**
 * (SERVICE) BackEndService
 * Used for communicating with LittleWeebs backend using Websockets
 * 
 * 
 * @export
 * @class BackEndService
 */
@Injectable()
export class BackEndService {

    public websocketMessages : Subject<any> = new BehaviorSubject<any>({"type" : "NOMESSAGE"});
    public websocketConnected : Subject<string> = new BehaviorSubject<string>(null);
    public osVersion : string = "";
    public connectingState : string = "";
    public address : string;
    public connected : boolean;

    private websocket : any;
    private interval: any;
    private messageQue: string[];
    private receivedConfirmed: boolean;
    private enableDebugging : boolean = true;

    /**
     * Creates an instance of BackEndService.
     * Requests base download dir and gets default irc settings from localstorage (if there is something stored there)
     * Send connect to irc server request to back-end
     * @param {ShareService} shareService (used for sending and receiving information to/from other Components & Services)
     * @memberof BackEndService
     */
    constructor(private shareService:ShareService){
        this.consoleWrite("Initiated backend!");
        this.receivedConfirmed = false;
        this.messageQue = [];
        this.connected = false;
        let baseDownloadDirBe = this.shareService.getDataLocal("baseDownloadDir");
        this.websocketMessages.subscribe((messageRec) => {
             if(messageRec !== null){
                this.consoleWrite("Message received:");
                this.consoleWrite(messageRec);
                if(messageRec.type == "irc_data"){
                    if(messageRec.state == "connected"){
                        if(!this.connected){                            
                            this.shareService.showMessage("succes", "Connected!");
                            this.shareService.hideLoader();
                            this.connected = true;
                        } else {
                            this.connected = false;
                        }
                    } else {
                        
                        this.connected = false;
                        
                    }

                    if(!baseDownloadDirBe){
                        this.sendMessage({"action" : "set_download_directory", "extra" : { "path" :"\\"}});
                        
                        this.shareService.storeDataLocal("baseDownloadDir", "\\");
                    } else {
                        
                        baseDownloadDirBe = this.shareService.getDataLocal("baseDownloadDir");
                    }
                    this.shareService.baseDownloadDirectory = messageRec.downloadlocation;
                    this.shareService.isLocal = messageRec.local;
                    this.osVersion =  messageRec.osVersion;
                    this.connectingState = messageRec.state;
                } else if(messageRec.type == "welcome"){
                    try{
                        let currentConnectionSettingsString= this.shareService.getDataLocal("custom_irc_connection");
                        if(currentConnectionSettingsString != false){
                            this.consoleWrite("Found stored connection setting, using that instead of default values!");
                            let currentConnectionSettings = JSON.parse(currentConnectionSettingsString);
                            
                            
                            this.sendMessage({"action" : "disconnect_irc"});
                            this.sendMessage({"action" : "connect_irc", "extra" : currentConnectionSettings});


                        } else {
                            this.sendMessage({"action" : "disconnect_irc"});
                            this.sendMessage({"action" : "connect_irc", "extra" : {"address":"irc.rizon.net", "username": "", "channels": "#horriblesubs,#nibl,#news"}});
                        }
                    } catch(e){
                        this.consoleWrite(e);
                        setTimeout(()=>{
                            this.sendMessage({"action" : "disconnect_irc"});
                            this.sendMessage({"action" : "connect_irc", "extra" : {"address":"irc.rizon.net", "username": "", "channels": "#horriblesubs,#nibl,#news"}});
                        },1000);
                    }
                }

             }            
        })
    }

   /**
    * Starts connection with back-end if available, and retries if not (shows message when it can't connect)
    * 
    * @param {string} address (address of backend)
    * @memberof BackEndService
    */
   async tryConnecting(address : string){
        this.address = address;
        this.shareService.showLoaderMessage("Waiting for connection to backend!");
        this.websocket = new WebSocket("ws://" + address + ":1515");
            
        this.websocket.onopen = (evt : any) =>{
            this.websocketConnected.next(evt);            
            this.shareService.showLoaderMessage("Waiting for connection to IRC!");
            this.sendMessage({"action": "get_irc_data"});
            
            this.messageQue = [];
            clearInterval(this.interval);
        };
        this.websocket.onmessage = (evt : any) => {
            try{                        
                this.websocketMessages.next(JSON.parse(evt.data));
            } catch (e){
                this.websocketMessages.next({"error" : "parsing-messesage: '" + evt.data + "'"});
                this.consoleWrite(e);
            }
        }
        this.websocket.onclose = (evt : any)=>{
            this.shareService.showMessage("succes", "Lost connection with backend! Refresh for retry!");   
            if(!this.shareService.isLocal){
                this.shareService.hideLoader();
                this.connected = false;
                this.shareService.showModal("Wups!", 
                "I unfortunately lost connection with my backend, just like humans, without my back, I am nothing. You could try reloading. Please check if the backend has crashed or not. If something unexpected happend, you can notify the developer. Please provide the log file generated by the backend!", 
                "frown", 
                `
                    <a onclick="location.href=location.href" class="ui green basic cancel inverted button">
                        <i class="refresh icon"></i>
                        Close.
                    </a>
                    <a href="https://github.com/EldinZenderink/LittleWeeb/issues" class="ui red ok basic inverted button">
                    <i class="announcement icon"></i>
                    Notify the developer!
                    </a>
                ` );                
            }
           
        }
    }

    /**
     * Send message to backend
     * Uses a message que so that it won't hammer the back-end with requests to give the back-end time to respond.
     * 
     * @param {*} message (message to send)
     * @memberof BackEndService
     */
    sendMessage(message: any) {
        this.consoleWrite("pusing message ");
        this.consoleWrite(message);
        this.consoleWrite( " to the que");
        
        this.receivedConfirmed = false;
        this.messageQue.push(JSON.stringify(message));
        try {      
            setInterval(() => {
                try {
                    if(this.websocket.readyState === this.websocket.CLOSED && this.websocket.readyState !== this.websocket.CONNECTING && this.websocket.readyState !== this.websocket.CLOSING && this.websocket.readyState !== this.websocket.OPEN){
                        this.tryConnecting(this.address);
                    } else if (this.messageQue.length > 0) {
                        this.websocket.send(this.messageQue[0]);

                        this.messageQue.splice(0, 1);
                        this.receivedConfirmed = false;
                    }

                

                } catch (Ex) {
                    this.consoleWrite("Cannot send message, websocket hasn't been opened yet: ");
                    this.consoleWrite(Ex);

                }

            }, 250);
        }catch(e){
            this.consoleWrite(e);
        }
    }

    /**
     * Custom console.log function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof BackEndService
     */
    async consoleWrite(log: any){
        if(this.enableDebugging){
            console.log(log);
        }
    }

    
    
}


