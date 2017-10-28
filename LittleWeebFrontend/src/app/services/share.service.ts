import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class ShareService {

    public packlistsub : Subject<string> = new BehaviorSubject<string>(null);
    public animetitlesub : Subject<string> = new BehaviorSubject<any>(null);
    public newdownload : Subject<any> = new BehaviorSubject<any>(null);
    public downloadamount : Subject<number> = new BehaviorSubject<number>(null);
    public toastmessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public loaderMessage : Subject<string> = new BehaviorSubject<string>(null);
    public modalMessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public currentlyawaitingdownloads : any[];
    public botlist : Object;

    //this service shares information between different components, be it services, views or extras.
    constructor(){
        this.currentlyawaitingdownloads = [];
    }
    
    //for views/packlist.component
    getBotList(){
        return this.botlist;
    }

    //for views/packlist.component
    setBotList(newbotlist : Object){
        this.botlist = newbotlist;
    }

    //for views/packlist.component
    clearBotList(){
        this.botlist = null;
    }

    //for views/packlist.component
    setAnimeTitle(anime: any){
        this.animetitlesub.next(anime);
    }

    //for views/packlist.component
    clearAnimeTitle(){
        this.animetitlesub.next();
    }

    //for views/packlist.component
    setPackList(json : any){
        var jsoncombined = JSON.stringify(json);
        this.packlistsub.next(JSON.stringify(jsoncombined));
    }
    
    //for views/packlist.component
    clearPackList(){
        this.packlistsub.next();
    }

    //for views/download.component
    appendNewDownload(json : any){
        console.log("Appending newdownload : 52");
        this.newdownload.next(json);
        this.currentlyawaitingdownloads.push(json);
        this.downloadamount.next(this.currentlyawaitingdownloads.length);
    }

    //for views/download.component
    clearNewDownload(){
        this.newdownload.next();        
        this.currentlyawaitingdownloads = [];
        this.downloadamount.next(this.currentlyawaitingdownloads.length);
    }

    //for views/download.component
    removeNewDownload(index: number){
        console.log("Removing newdownload at index " + index + " : 64");
        this.currentlyawaitingdownloads.splice(index, 1);   
        this.downloadamount.next(this.currentlyawaitingdownloads.length);        
        this.newdownload.next();
    }

    //for menu.component
    updateAmountOfDownloads(num:number){
        this.downloadamount.next(num);
    }    
   
    //for extras/toaster.component
    showMessage(type: string, msg:string){
        var tobeshown = [type, msg];
        this.toastmessage.next(tobeshown);
    }

    //for extras/loader.component
    showLoaderMessage(message: string){
        this.loaderMessage.next(message);
    }

    //for extras/loader.component
    showLoader(){
        this.loaderMessage.next("Loading");
    }

    //for extras/loader.component
    hideLoader(){
        this.loaderMessage.next("HIDELOADER");
    }

    //for extras/modal.component
    showModal(title:string,message:string,icon:string,actions:string){
        var combine = [title,message,icon,actions];
        this.modalMessage.next(combine);
    }

    //for extras/modal.component
    hideModal(){
        var combine = ["HIDE"];
        this.modalMessage.next(combine);
    }

}