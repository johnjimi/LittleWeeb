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
    templateUrl: './html/settings.component.html',
    styleUrls: ['./css/settings.component.css']
})
export class Settings {

    downloadlocation : string;
    strictnessValue : number = 25;

    address: string = "irc.rizon.net";
    channels: string = "#nibl,#horriblesubs,#news";
    username : string = "";
    connectionStatus : string = "Disconnected.";

    customDirPerAnimeCheckBox : boolean = false;

    //setup the settings component
    constructor(private backEndService: BackEndService, private shareService: ShareService){
        this.downloadlocation = "Waiting for back-end";
        this.strictnessValue = this.shareService.searchStrictness;
    }

    //on init, request the current download directory from backend
    ngOnInit(){
        
        let baseDownloadDirBe = this.shareService.getDataLocal("baseDownloadDir");

        this.backEndService.websocketMessages.subscribe((message) => {
            if(message !== null){
                if(message.type == "irc_data"){
                    if(!baseDownloadDirBe){
                        this.shareService.storeDataLocal("baseDownloadDir", message.downloadlocation);
                    } 
                    
                    this.downloadlocation = message.downloadlocation;

                    if(message.connected){
                        this.connectionStatus = "Connected.";
                    } else {
                        this.connectionStatus = "Disconnected.";
                    }
                }
            }
        });
        this.backEndService.sendMessage({"action" : "get_irc_data"});
        let currentConnectionSettingsString= this.shareService.getDataLocal("custom_irc_connection");
        if(currentConnectionSettingsString != false){

            let currentConnectionSettings = JSON.parse(currentConnectionSettingsString);
            this.address = currentConnectionSettings.address;
            this.channels = currentConnectionSettings.channels;
            this.username = currentConnectionSettings.username;
        }

        let customDirPerAnime = this.shareService.getDataLocal("CustomDirectoryPerAnime");
        if(!customDirPerAnime){
            this.shareService.storeDataLocal("CustomDirectoryPerAnime", "enabled");
        } else {
            if(customDirPerAnime == "enabled"){
                this.customDirPerAnimeCheckBox = true;
            } else {
                this.customDirPerAnimeCheckBox = false;
            }
        }
        
     


    }

    ngOnDestroy(){
        
        //this.backEndService.websocketConnected.unsubscribe();
        //this.backEndService.websocketMessages.unsubscribe();
    }

    toggleCustomDirectoryPerAnime(){
        let customDirPerAnime = this.shareService.getDataLocal("CustomDirectoryPerAnime");
        console.log("custom dir check clicked");
        console.log(customDirPerAnime);
        if(!customDirPerAnime){
            this.shareService.storeDataLocal("CustomDirectoryPerAnime", "enabled");
        } else {
            if(customDirPerAnime == "enabled"){
                this.customDirPerAnimeCheckBox = false;
                this.shareService.storeDataLocal("CustomDirectoryPerAnime", "disabled");
                console.log("disabled custom dir");
            } else {
                this.customDirPerAnimeCheckBox = true;
                this.shareService.storeDataLocal("CustomDirectoryPerAnime", "enabled");
                console.log("enabled custom dir");
            }
        }
    }

    //opens the file dailog to select a download directory
    openFileDialog(){
        console.log("opening file dialog");        
        //this.backEndService.sendMessage({"action" : "set_download_directory"});
        this.shareService.showFileDialog();
    }

    // not implemented yet
    setCustomConnection(){
        let newConnection = {address : this.address, channels: this.channels, username: this.username};
        this.shareService.storeDataLocal("custom_irc_connection", JSON.stringify(newConnection));
        this.connectToIrcServer();
    }

    connectToIrcServer(){
        this.backEndService.sendMessage({"action" : "connect_irc", "extra" : {address : this.address, channels: this.channels, username: this.username}});
    }

    disconnectIrcServer(){
        this.backEndService.sendMessage({"action" : "disconnect_irc"});
    }

    setSliderValue(value :number){
        console.log("Strictness: " + value);
        this.shareService.searchStrictness = value;
        this.strictnessValue = value;
    }

    setDefaultConnection(){
        let newConnection = {address : "irc.rizon.net", channels: "#nibl, #horriblesubs, #news", username: ""};
        this.address = newConnection.address;
        this.channels = newConnection.channels;
        this.username = newConnection.username;
        this.shareService.storeDataLocal("custom_irc_connection", JSON.stringify(newConnection));
        this.connectToIrcServer();
    }


    
}