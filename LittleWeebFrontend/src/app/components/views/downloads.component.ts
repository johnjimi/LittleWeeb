import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'

import {Subject} from 'rxjs/Rx';
import {Pipe} from '@angular/core';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Component({
    selector: 'downloads',
    template: `
        <div class="ui horizontal divider"> DOWNLOAD QUE </div>
        <div class="row">
            <table class="ui very basic table" style="width: 100%; background-color: white;">
            <thead>
                <tr>
                <th style="width: 10%;">File</th>
                <th style="width: 10%;">Size</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 40%;">Progress</th>
                <th style="width: 40%;">Options</th>
                </tr>
            </thead>
            <tbody id="listWithDownloads">
                <tr *ngFor="let download of downloads">
                    <td id="filename_{{download.id}}">{{download.filename}}</td>
                    <td id="status_{{download.id}}">{{download.filesize}} Mb</td>
                    <td id="status_{{download.id}}">{{download.status}}</td>
                    <td>
                        <div class="ui progress" id="progress_{{download.id}}" [attr.data-percent]="download.progress" >
                            <div class="bar">
                                <div class="progress"></div>
                            </div>
                            <div class="label" id="speed_{{download.id}}">{{download.speed}} kB/s</div>
                        </div>
                    </td>
                    <td id="buttons_{{download.id}}">
                        <p>
                            <button style="width: 100px" (click)="sendPlayRequest(download)" class="ui primary button">Play</button>
                            <button style="width: 100px" (click)="sendOpenLocationRequest(download)"  class="ui primary button">Open Location</button>
                        </p>
                        <p>
                            <button style="width: 100px" (click)="sendAbortRequest(download)"  class="ui primary button">Abort</button>
                            <button style="width: 100px" (click)="sendDeleteRequest(download)"  class="ui primary button">Delete</button>
                        </p>
                    </td>
                </tr>
            </tbody>
            </table>
        </div> 
        <div class="ui horizontal divider"> ALREADY DOWNLOADED </div>
        <div class="row">
            <table class="ui very basic table" style="width: 100%; background-color: white;">
            <thead>
                <tr>
                    <th>File</th>
                    <th>Size</th>
                    <th>Options</th>
                </tr>
            </thead>
            <tbody id="listWithDownloads">
                <tr *ngFor="let download of alreadyDownloaded">
                    <td id="filename_{{download.id}}">{{download.filename}}</td>
                    <td id="filename_{{download.id}}">{{download.filesize}} Mb</td>
                    <td id="buttons_{{download.id}}">
                        <p>
                            <button style="width: 200px" (click)="sendPlayRequest(download)" class="ui primary button">Play</button>
                            <button style="width: 200px" (click)="sendOpenLocationRequest(download)"  class="ui primary button">Open Location</button>
                        </p>
                        <p>
                            <button style="width: 200px" (click)="sendAbortRequest(download)"  class="ui primary button">Abort</button>
                            <button style="width: 200px" (click)="sendDeleteRequest(download)"  class="ui primary button">Delete</button>
                        </p>
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
    `,
})


export class Downloads {
    downloads : any[];
    alreadyDownloaded : any[];

    /*shows the currently downloading and already downloaded files    
     *it checks if there if there are new downloads to be appended to the list
     *it checks of currently downloading statistics need to be updated
     */
    constructor(private router:Router, private shareService : ShareService, private backEndService : BackEndService, private semanticService:SemanticService){
        console.log("init download page");
        this.downloads = [];
        this.alreadyDownloaded = [];

         this.shareService.newdownload.subscribe(() => {
            this.downloads =  this.shareService.currentlyawaitingdownloads;
            var latestadded = this.downloads[this.downloads.length - 1];
            console.log(JSON.stringify(latestadded));
            try{                
                this.backEndService.sendMessage("AddToDownloads:" + latestadded.id + ":" + latestadded.pack + ":" + latestadded.bot);
            } catch(e) {
                console.log(e);
            }   
        });        

        this.backEndService.websocketMessages.subscribe((message) => {
            if(message !== null){
                console.log(message);
                if(message.indexOf("DOWNLOADUPDATE") > -1 && message.indexOf("NO DOWNLOAD") == -1){
                    var data = message.split(':');
                    var dataToUpdate = {
                        id: data[1],
                        progress: data[2],
                        speed: data[3],
                        status: data[4],
                        filename: data[5],
                        filesize: data[6]
                    };
                    let obj = this.downloads.find(x => x.id === dataToUpdate.id);
                    let index = this.downloads.indexOf(obj);
                    if(index > -1){
                        this.downloads[index].progress = dataToUpdate.progress;
                        this.downloads[index].status = dataToUpdate.status;
                        this.downloads[index].speed = dataToUpdate.speed;
                        this.downloads[index].filename = dataToUpdate.filename;
                        this.downloads[index].filesize = dataToUpdate.filesize;
                        if(message.indexOf("COMPLETED") > -1){
                            this.shareService.removeNewDownload(index);
                            setTimeout(()=>{
                                this.backEndService.sendMessage("GetAlreadyDownloadedFiles");
                            }, 1000);
                            
                        }
                        this.semanticService.updateProgress('#progress_' + dataToUpdate.id, dataToUpdate.progress);
                    } else {
                        this.downloads.push(dataToUpdate);
                    }                      
                    
                } 
                if (message.indexOf("ALREADYDOWNLOADED")> -1){
                    var objects = message.split(',');
                    console.log(objects);
                    for(let object of objects){
                        var data = object.split(':');
                        console.log(data);
                        if(data.length > 1){
                            var dataToUpdate = {
                                id: data[0],
                                progress: data[1],
                                speed: data[2],
                                status: data[3],
                                filename: data[4],
                                filesize: data[5]
                            };
                            let obj = this.alreadyDownloaded.find(x => x.id === dataToUpdate.id);
                            let index = this.alreadyDownloaded.indexOf(obj);
                            if(index > -1){
                                this.alreadyDownloaded[index].progress = dataToUpdate.progress;
                                this.alreadyDownloaded[index].status = dataToUpdate.status;
                                this.alreadyDownloaded[index].speed = dataToUpdate.speed;
                                this.alreadyDownloaded[index].filename = dataToUpdate.filename;
                                this.alreadyDownloaded[index].filesize = dataToUpdate.filesize;

                            } else {
                                this.alreadyDownloaded.push(dataToUpdate);        
                            }
                        }
                    }
                }
            }
        });
        
    }

    //on init, it gets the currently downloaded files from the backend
    ngOnInit(){
        this.backEndService.websocketConnected.subscribe(data => {            
            this.backEndService.sendMessage("GetAlreadyDownloadedFiles");
            console.log("websocket is running");
        });     
    }

    //send request to open/play a certain file
    sendPlayRequest(download : any){
        this.backEndService.sendMessage("PlayFile:" + download.id + ":" + download.filename);
    }

    //send request to open download location directory
    sendOpenLocationRequest(download : any){
        this.backEndService.sendMessage("OpenDirectory");
    }

    //send request to stop the current download
    sendAbortRequest(download : any){
        this.backEndService.sendMessage("AbortDownload");
    }

    //send request to delete a file
    sendDeleteRequest(download : any){
        var index =  this.shareService.currentlyawaitingdownloads.indexOf(download);
        this.shareService.removeNewDownload(index);

        var index = this.alreadyDownloaded.indexOf(download);
        if(index > -1){
            this.alreadyDownloaded.splice(index, 1);
        }

        this.backEndService.sendMessage("DeleteDownload:" + download.id + ":" + download.filename);
        this.backEndService.sendMessage("GetAlreadyDownloadedFiles");
    }
}