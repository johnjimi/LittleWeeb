import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {DownloadService} from '../../services/download.service'
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
                <th style="width: 20%;">File</th>
                <th style="width: 20%;">Size</th>
                <th style="width: 20%;">Status</th>
                <th style="width: 20%;">Progress</th>
                <th style="width: 20%;">Speed</th>
                <th style="width: 20%;">Options</th>
                </tr>
            </thead>
            <tbody id="listWithDownloads">
                <tr *ngFor="let download of downloads">
                    <td id="filename_{{download.id}}">{{download.filename}}</td>
                    <td id="status_{{download.id}}">{{download.filesize}} Mb</td>
                    <td id="status_{{download.id}}">{{download.status}}</td>
                    <td>
                        <div style="text-align: center;"> {{download.progress}}% </div><br/>
                        <progress style="min-width:100%; min-height: 15px;" [value]="download.progress" max="100">{{download.progress}}%</progress>
                    </td>
                    <td>                        
                        <div style="text-align: center;"> {{download.speed}} kB/s </div>
                    </td>
                    <td id="buttons_{{download.id}}">
                        <p>
                            <button style="width: 100px; margin-bottom: 5px;" (click)="sendPlayRequest(download)" class="ui primary button">Play</button>
                            <button style="width: 100px; margin-bottom: 5px;" (click)="sendOpenLocationRequest(download)"  class="ui primary button">Open Location</button>
                            <button style="width: 100px; margin-bottom: 5px;" (click)="sendAbortRequest(download)"  class="ui primary button">Abort</button>
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
    constructor(private router:Router, private downloadService:DownloadService, private shareService : ShareService, private backEndService : BackEndService, private semanticService:SemanticService){
        console.log("init download page");
        this.downloads = [];
        this.alreadyDownloaded = [];

        this.downloadService.updateDownloadList.subscribe((listwithdownloads)=>{
            if(listwithdownloads != null){                
                this.downloads = listwithdownloads;
               
            }
        });

        this.downloadService.updateAlreadyDownloadedList.subscribe((listwithdownloads)=>{
            if(listwithdownloads != null){                
                this.alreadyDownloaded = listwithdownloads;
            }
        });
    }

    //on init, it gets the currently downloaded files from the backend
    ngOnInit(){
        this.downloadService.getDownloadList();
        this.downloadService.getAlreadyDownloaded();
    }

    //send request to open/play a certain file
    sendPlayRequest(download : any){
        this.backEndService.sendMessage({"action" : "play_file", "extra" : download});
    }

    //send request to open download location directory
    sendOpenLocationRequest(download : any){
        this.backEndService.sendMessage({"action" : "open_download_directory"});
    }

    //send request to stop the current download
    sendAbortRequest(download : any){
       this.backEndService.sendMessage({"action" : "abort_download"});
    }

    //send request to delete a file
    sendDeleteRequest(download : any){
       this.downloadService.removeDownload(download);
    }
}