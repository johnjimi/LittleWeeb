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

/**
 * (VIEW) Show download view,
 * Component for showing downloads and to send requests to manipulate download to the backend.
 * 
 * @export
 * @class Downloads
 */
@Component({
    selector: 'downloads',
    templateUrl: './html/downloads.component.html',
    styleUrls: ['./css/downloads.component.css']
})


export class Downloads {
    downloads : any;
    alreadyDownloaded : any;
    isLocal : boolean;
    /**
     * Creates an instance of Downloads.
     * @param {Router} router (used for rerouting to other places if necesary)
     * @param {DownloadService} downloadService (used to get download updates)
     * @param {ShareService} shareService (used to share information between components)
     * @param {BackEndService} backEndService (used to communicate with the backend)
     * @param {SemanticService} semanticService (used to manipulate semanticui css framework (through jquery))
     * @memberof Downloads 
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

    /**
     * Loads downloads & gets already downloaded
     * 
     * @memberof Downloads
     */
    ngOnInit(){
        this.downloadService.getDownloadList();
        this.downloadService.getAlreadyDownloaded();
    }

    /**
     * 
     * Sends a play request to the backend
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendPlayRequest(download : any){
        console.log("play: ");
        console.log(download);
        if(this.isLocal){
            setTimeout(() => {this.backEndService.sendMessage({"action" : "open_file", "extra" : download});}, 1000);
        }        
    }

    /**
     * Sends open file location to the backend
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendOpenLocationRequest(download : any){
        if(this.isLocal){            
            this.backEndService.sendMessage({"action" : "open_download_directory"});
        }  
    }

    /**
     * Sends abort request to the backend
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendAbortRequest(download : any){
       this.backEndService.sendMessage({"action" : "abort_download"});
    }

    /**
     * Sends a delete request to the backend
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    sendDeleteRequest(download : any){
       this.downloadService.removeDownload(download);
    }

    /**
     * Sends a download request to local machine via http
     * 
     * @param {*} download (gets a json object as parameter with download information)
     * @memberof Downloads
     */
    getUrl(download : any){
        var ip =  window.location.hostname;
        this.shareService.showModal("Here is your url!", 
                                    `You can either copy the following url, or hit download to download the file in question. <br \>
                                     <div >
                                        <p><h3>http://` + ip + `:6010?sendFile=` + download.downloadDirectory + `/`+ download.filename + `</h3></p>
                                    </div>
                                    `, 
                                    "linkify", 
                                    `<div class="ui red basic cancel inverted button">
                                        <i class="remove icon"></i>
                                        Cancel
                                     </div>
                                     <a target="_blank" href="http://` + ip + `:6010?sendFile=` + + download.downloadDirectory + `/`+ download.filename + `" class="ui green ok inverted button">
                                        <i class="checkmark icon"></i>
                                        Download
                                     </a>
                                     `);
    }
}