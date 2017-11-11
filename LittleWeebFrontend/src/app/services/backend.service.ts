import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';
import {ShareService} from './share.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class BackEndService {

    public websocketMessages : Subject<any> = new BehaviorSubject<any>({"type" : "NOMESSAGE"});
    public websocketConnected : Subject<string> = new BehaviorSubject<string>(null);
    websocket : any;
    interval: any;
    messageQue: string[];
    receivedConfirmed: boolean;
    //initiates backend
    constructor(private http: Http, private shareService:ShareService){
        console.log("Initiated backend!");
        this.receivedConfirmed = false;
        this.messageQue = [];
        this.tryConnecting(); 
        
        this.websocketMessages.subscribe((messageRec) => {
             if(messageRec !== null){
                console.log("Message received:");
                console.log(messageRec);
                if(messageRec.type == "irc_data"){
                    if(messageRec.connected){
                        this.shareService.hideLoader();
                        this.shareService.showMessage("succes", "Connected!");
                    }
                }

             }            
        })
    }

    //connects to the backend
    tryConnecting(){
        
        this.shareService.showLoaderMessage("Waiting for connection to backend!");
        this.interval =  setInterval(async() => {
            try{
                
                this.websocket = new WebSocket("ws://localhost:600");
            
                this.websocket.onopen = (evt : any) =>{
                    this.websocketConnected.next(evt);
                    this.shareService.hideLoader();
                    this.shareService.showLoaderMessage("Waiting for connection to IRC!");
                    this.sendMessage({"action": "get_irc_data"});
                    clearInterval(this.interval);
                };
                this.websocket.onmessage = (evt : any) => {
                    this.websocketMessages.next(JSON.parse(evt.data));
                }
                this.websocket.onclose = (evt : any)=>{
                    this.shareService.showMessage("succes", "Lost connection to backend!");
                    this.tryConnecting();
                }
            } catch (e){};

        }, 1000);
    }

    //sends a message to the backend
    sendMessage(message: any) {
        console.log("pusing message " + message + " to the que");
        
        this.receivedConfirmed = false;
        this.messageQue.push(JSON.stringify(message));
        try {
        

        setInterval(() => {
            try {
                if (this.messageQue.length > 0) {
                    this.websocket.send(this.messageQue[0]);

                    this.messageQue.splice(0, 1);
                    this.receivedConfirmed = false;
                }

            } catch (Ex) {
                console.log("Cannot send message, websocket hasn't been opened yet: ");
                console.log(Ex);
            }

        }, 250);
        }catch(e){
            console.log(e);
        }
    }
    
}


