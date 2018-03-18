import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {KeysPipe} from '../../pipes/key.pipe';
@Component({
    selector: 'filedialog',
    templateUrl: './html/filedialog.component.html',
    styleUrls: ['./css/filedialog.component.css']
})
//these should be shown in the main component/parent component (in this case thats app.component.ts)
export class FileDialog {
    directoryList : any[];
    currentDirectoryPathSelected : string;
    currentlyDirectoryPathViewing : string;
    showCreate : boolean;
    //shows a modal screen with a message and possible actions 
    constructor(private shareService:ShareService, private semanticService:SemanticService, private backEndService:BackEndService){
        this.currentDirectoryPathSelected = "Drives";
        this.currentlyDirectoryPathViewing ="Drives";
        this.semanticService.hideModal('.ui.modal.filedialog');
        this.showCreate = false;
        this.shareService.showFileDialogEvent.subscribe(message=>{  
            if(message != null){               
                if(message){
                    
                    this.backEndService.sendMessage({"action" : "get_directories"});
                    this.semanticService.showModal('.ui.modal.filedialog');
                     
                } else {
                     this.semanticService.hideModal('.ui.modal.filedialog');
                }
            } 
        });
        this.directoryList = [];
        this.backEndService.websocketMessages.subscribe((message) =>{

            if(message.type == "directories"){
                this.directoryList = message.directories;
            }

        });
    }

    openDir(path : string){ 
         this.backEndService.sendMessage({"action" : "get_directories", "extra" : {"path" : path}});
         this.currentDirectoryPathSelected = path;
    }

    selectDir(){
        this.backEndService.sendMessage({"action" : "set_download_directory", "extra" : { "path" : this.currentDirectoryPathSelected}});
        this.shareService.storeDataLocal("baseDownloadDir",this.currentDirectoryPathSelected);
    }

    goBackDir(){
        var currentDir = this.currentDirectoryPathSelected;
        var previousDirs = currentDir.split('\\');
        var previousDir = previousDirs[previousDirs.length - 2];

        if((previousDirs.length - 2) >= 0){            
            this.backEndService.sendMessage({"action" : "get_directories", "extra" : {"path" : previousDir}});
            this.currentDirectoryPathSelected = previousDir;
        } else {
            this.backEndService.sendMessage({"action" : "get_directories"});
            this.currentDirectoryPathSelected = "Drives";
        }
    }

    createDir(path : string){
        if(this.currentDirectoryPathSelected != "DRIVES" && this.currentlyDirectoryPathViewing != "DRIVES"){            
            this.backEndService.sendMessage({"action" : "create_directory", "extra" : {"path" : this.currentDirectoryPathSelected + "/" + path}});
            setTimeout(() => {            
                this.openDir(this.currentDirectoryPathSelected + "/" + path);
            }, 500);
        } else {
            this.shareService.showMessage("succes", "You cannot create a directory in the drives view!");
        }
    }
}