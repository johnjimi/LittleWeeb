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
    selector: 'settings',
    template: `<div class="ui horizontal divider"> SETTINGS </div>
            <div class="ui form">
              <div class="field">
                <label>Custom Server - Where this UI is connected to. (NOT WORKIN (WIP))</label>
                <input style="width: 90%;" id="customServer" type="text" name="customServer" placeholder="Default: Local - Example: x.x.x.x"> 
                <button style="width: 8%;" class="ui primary button" (click)="setCustomServer()">Set</button>
              </div>
              <div class="field">
                <label>Download Location</label>
                <input style="width: 90%;" id="downloadLocation" type="text" name="downloadLocation" placeholder="{{downloadlocation}}"> 
                <button style="width: 8%;" class="ui primary button" (click)="openFileDialog()">Select</button>
              </div>
              <div class="field">
                <label>Custom Channel(s) - Seperate with ',' (NOT WORKIN (WIP))</label>
                <input style="width: 90%;" id="customServer" type="text" name="customChannels" placeholder="Default: horriblesubs,nibl,news"> 
                <button style="width: 8%;" class="ui primary button" (click)="setChannels()">Set</button>
              </div>
            </div>`,
})
export class Settings {

    downloadlocation : string;

    //setup the settings component
    constructor(private backEndService: BackEndService, private shareService: ShareService){
        this.downloadlocation = "Directory";
    }

    //on init, request the current download directory from backend
    ngOnInit(){
        this.backEndService.websocketMessages.subscribe((message) => {
            if(message !== null){
                if(message.type == "irc_data"){
                    this.downloadlocation = message.downloadlocation;
                }
            }
        });
        this.backEndService.sendMessage({"action" : "get_irc_data"});
    }

    ngOnDestroy(){
        
        //this.backEndService.websocketConnected.unsubscribe();
        //this.backEndService.websocketMessages.unsubscribe();
    }

    //opens the file dailog to select a download directory
    openFileDialog(){
        console.log("opening file dialog");        
        //this.backEndService.sendMessage({"action" : "set_download_directory"});
        this.shareService.showFileDialog();
    }

    // not implemented yet
    setCustomServer(){
        console.log("to be implemented");
    }    
    
    // not implemented yet
    setChannels(){
        console.log("to be implemented");
    }
    
}