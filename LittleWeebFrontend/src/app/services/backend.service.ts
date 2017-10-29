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

    public websocketMessages : Subject<string> = new BehaviorSubject<string>(null);
    public websocketConnected : Subject<string> = new BehaviorSubject<string>(null);
    websocket : any;
    interval : any;
    //initiates backend
    constructor(private http: Http, private shareService:ShareService){
        console.log("Initiated backend!");
    
        this.tryConnecting();     
    }

    //connects to the backend
    tryConnecting(){
        
        this.shareService.showLoaderMessage("Waiting for connection to backend!");
        this.interval =  setInterval(async() => {
            console.log("trying to connect and get an IP");
            var response = await this.http.get('http://localhost:6010/whatsyourip').toPromise();
            console.log();
            var ip = JSON.stringify(response).split('"')[3].split('"')[0];
                console.log(ip);
            try{
                
                this.websocket = new WebSocket("ws://" + ip + ":600");
            
                this.websocket.onopen = (evt : any) =>{
                    this.websocketConnected.next(evt);
                    this.shareService.hideLoader();
                    this.shareService.showMessage("succes", "Connected!");
                    clearInterval(this.interval);
                    
                };
                this.websocket.onmessage = (evt : any) => {
                    this.websocketMessages.next(evt.data);
                }
                this.websocket.onclose = (evt : any)=>{
                    this.shareService.showMessage("succes", "Lost connection to backend!");
                    this.tryConnecting();
                }
            } catch (e){};

        }, 1000);
    }


    //sends a message to the backend
    sendMessage(message :string){
        try{
            console.log("SENDING OVER WEBSOCKETS: "  + message);
            this.websocket.send(message);
          
        } catch(Ex){
            console.log("Cannot send message, websocket hasn't been opened yet: ");
            console.log(Ex);
        }
    }
    
}


