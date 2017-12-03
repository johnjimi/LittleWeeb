import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {KeysPipe} from '../../pipes/key.pipe';
@Component({
    selector: 'filedialog',
    template: `<div class="ui modal filedialog" >
                    <div class="ui icon header">
                        <i class="folder open outline icon" ></i>
                        Currently viewing directory: {{currentlyDirectoryPathViewing}}
                    </div>
                    <div class="scrolling content" style="text-align: center; max-height: 400px;">
                        <p> <b>Current path: {{currentDirectoryPathSelected}} </b></p>
                        
                        <div *ngIf="showCreate">
                            <div class="ui icon input"  style="width: 100%;">
                                <input #searchInput class="prompt" type="text" placeholder="Type your directory name here!" />
                                <button (click)="createDir(searchInput.value); this.showCreate = false;" class="ui red button" >                                     
                                    Create
                                </button>
                                 <button (click)="this.showCreate = false;" class="ui green button" >                                     
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div class="ui divider"></div>
                        <button (click)="this.showCreate = true;" class="ui  button" style="min-width:100%">                                     
                            Create Directory
                        </button>                        
                        <div class="ui divider"></div>
                        <button (click)="goBackDir()" class="ui  button" style="min-width:100%">                                     
                            Go back.
                        </button>
                        <table style="border-spacing: 0;" cellspacing="0" class="ui very basic table" style="width: 100%;">
                            <thead>
                                <tr>
                                <th style="width: 100%;">Directory</th>
                                </tr>
                            </thead>
                            <tbody id="listWithDownloads">
                                <tr *ngFor="let directory of directoryList">
                                    <td>
                                        <button (click)="openDir(directory.path); this.currentlyDirectoryPathViewing = directory.dirname;" class="ui  button" style="width:100%">                                       
                                           {{directory.dirname}}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="actions">
                        <div class="ui red cancel button">
                        <i class="remove icon"></i>
                            Cancel
                        </div>
                        <button (click)="selectDir()" class="ui green ok button">
                        <i class="checkmark icon"></i>
                            Set as directory.
                        </button>
                    </div>
                </div>`,
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
         this.backEndService.sendMessage({"action" : "get_directories", "extra" : path});
         this.currentDirectoryPathSelected = path;
    }

    selectDir(){
        this.backEndService.sendMessage({"action" : "set_download_directory_v2", "extra" : this.currentDirectoryPathSelected});
    }

    goBackDir(){
        var currentDir = this.currentDirectoryPathSelected;
        var previousDirs = currentDir.split('\\');
        var previousDir = previousDirs[previousDirs.length - 2];

        if((previousDirs.length - 2) >= 0){            
            this.backEndService.sendMessage({"action" : "get_directories", "extra" : previousDir});
            this.currentDirectoryPathSelected = previousDir;
        } else {
            this.backEndService.sendMessage({"action" : "get_directories"});
            this.currentDirectoryPathSelected = "Drives";
        }
    }

    createDir(path : string){
        if(this.currentDirectoryPathSelected != "DRIVES" && this.currentlyDirectoryPathViewing != "DRIVES"){            
            this.backEndService.sendMessage({"action" : "create_directory", "extra" : path});
            setTimeout(() => {            
                this.openDir(path);
            }, 500);
        } else {
            this.shareService.showMessage("succes", "You cannot create a directory in the drives view!");
        }
    }
}