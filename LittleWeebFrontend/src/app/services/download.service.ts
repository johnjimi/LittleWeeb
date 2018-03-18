import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable, Subject, BehaviorSubject} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import {ShareService} from './share.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class DownloadService {

    
    public downloadQue : any[];
    public alreadyDownloaded : any[];
    public updateDownloadList : Subject<any> = new BehaviorSubject<any>(null);
    public updateAlreadyDownloadedList : Subject<any> = new BehaviorSubject<any>(null);

    constructor(private backendService: BackEndService, private shareService:ShareService){
        this.downloadQue = [];
        this.alreadyDownloaded = [];
        this.backendService.websocketMessages.subscribe((message) => {
            if(message.type == "download_update"){
                if(message.status.indexOf("FAILED") == -1 && message.filename.indexOf("NO DOWNLOAD") == -1){
                    let obj = this.downloadQue.find(x => x.id == message.id);               
                    let index = this.downloadQue.indexOf(obj);
                    if(index != -1){
                        this.downloadQue[index] = message;
                        this.updateDownloadList.next(this.downloadQue); 
                        this.shareService.updateAmountOfDownloads(this.downloadQue.length);  
                    } else {
                        
                        this.downloadQue.push( message );
                        this.updateDownloadList.next(this.downloadQue);   
                        this.shareService.updateAmountOfDownloads(this.downloadQue.length);
                    }
                
                }
               
                if(message.status == "COMPLETED"){
                    let obj = this.downloadQue.find(x => x.filename == message.filename);               
                    let index = this.downloadQue.indexOf(obj);
                    this.downloadQue.splice(index, 1);
                    this.updateDownloadList.next(this.downloadQue); 
                    this.getAlreadyDownloaded();
                    this.shareService.updateAmountOfDownloads(this.downloadQue.length);  
                }

                if(message.status == "ABORTED"){
                    let obj = this.downloadQue.find(x => x.filename == message.filename);               
                    let index = this.downloadQue.indexOf(obj);
                    this.downloadQue.splice(index, 1);
                    this.updateDownloadList.next(this.downloadQue); 
                    this.getAlreadyDownloaded();  
                    this.shareService.updateAmountOfDownloads(this.downloadQue.length);
                }

                

            }

            if(message.type == "downloaded_directories"){
                console.log(message);
                this.updateAlreadyDownloadedList.next(message);
            }
        });
    }

    addDownload(download: any){
        this.downloadQue.push(download);

        let customDirPerAnime = this.shareService.getDataLocal("CustomDirectoryPerAnime");
        console.log("custom dir check clicked");
        console.log(customDirPerAnime);
        if(!customDirPerAnime){
            this.shareService.storeDataLocal("CustomDirectoryPerAnime", "enabled");
        } else {
            if(customDirPerAnime == "enabled"){
                
                this.backendService.sendMessage({"action": "add_download", "extra" : download});
            } else {

                download.dir = "NoSeperateDirectories";                
                this.backendService.sendMessage({"action": "add_download", "extra" : download});
            }
        }

        this.shareService.updateAmountOfDownloads(this.downloadQue.length);
       
    }

    removeDownload(download: any){
        this.backendService.sendMessage({"action" : "delete_file", "extra" : download});
        let obj = this.downloadQue.find(x => x.id == download.id);               
        let index = this.downloadQue.indexOf(obj);
        this.downloadQue.splice(index, 1);
        this.shareService.updateAmountOfDownloads(this.downloadQue.length);
        this.updateDownloadList.next(this.downloadQue);           
        this.getAlreadyDownloaded();
    }

    getAlreadyDownloaded(){
       this.backendService.sendMessage({"action" : "get_downloads"});
    }

    getDownloadList(){
       this.updateDownloadList.next(this.downloadQue);
    }

   
}