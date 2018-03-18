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
    templateUrl: './html/downloads.component.html',
    styleUrls: ['./css/downloads.component.css']
})


export class Downloads {
    downloads : any[];
    alreadyDownloaded : any[];
    isLocal : boolean;
    /*shows the currently downloading and already downloaded files    
     *it checks if there if there are new downloads to be appended to the list
     *it checks of currently downloading statistics need to be updated
     */
    constructor(private router:Router, private downloadService:DownloadService, private shareService : ShareService, private backEndService : BackEndService, private semanticService:SemanticService){
        console.log("init download page");
        this.downloads = [];
        this.alreadyDownloaded = [];
        this.isLocal = this.shareService.isLocal;

        if(this.backEndService.address.indexOf("local") > -1 || this.backEndService.address.indexOf("127.0.0.1") > -1){
            this.isLocal = true;
        }

        this.downloadService.updateDownloadList.subscribe((listwithdownloads)=>{
            if(listwithdownloads != null){                
                this.downloads = listwithdownloads;   
            }
        });

        this.downloadService.updateAlreadyDownloadedList.subscribe((listwithdownloads)=>{
            if(listwithdownloads != null){                
                this.alreadyDownloaded = listwithdownloads;                
                this.semanticService.enableAccordion();       
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
        if(this.isLocal){
            this.backEndService.sendMessage({"action" : "open_file", "extra" : download});
        }
        
    }

    //send request to open download location directory
    sendOpenLocationRequest(download : any){
        if(this.isLocal){            
            this.backEndService.sendMessage({"action" : "open_download_directory"});
        }  
    }

    //send request to stop the current download
    sendAbortRequest(download : any){
       this.backEndService.sendMessage({"action" : "abort_download"});
    }

    //send request to delete a file
    sendDeleteRequest(download : any){
       this.downloadService.removeDownload(download);
    }

    getUrl(download : any){
        var ip =  window.location.hostname;
        this.shareService.showModal("Here is your url!", 
                                    `You can either copy the following url, or hit download to download the file in question. <br \>
                                     <div >
                                        <p><h3>http://` + ip + `:6010?sendFile=` + download.filename + `</h3></p>
                                    </div>
                                    `, 
                                    "linkify", 
                                    `<div class="ui red basic cancel inverted button">
                                        <i class="remove icon"></i>
                                        Cancel
                                     </div>
                                     <a target="_blank" href="http://` + ip + `:6010?sendFile=` + download.filename + `" class="ui green ok inverted button">
                                        <i class="checkmark icon"></i>
                                        Download
                                     </a>
                                     `);
    }
}