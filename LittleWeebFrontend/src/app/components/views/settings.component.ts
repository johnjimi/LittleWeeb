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
/**
 * (VIEW) Shows Settings view,
 * Settings component, used to set settings such as IRC Connection (Server, Channels, Username), Download Directory & Resetting & Viewing local storage
 * 
 * Default settings;
 * IRC:
 * address: irc.rizon.net
 * channels: #nibl,#horriblesubs,#news
 * username: "" = let backend generate username
 * 
 * @export
 * @class Settings
 */
@Component({
    selector: 'settings',
    templateUrl: './html/settings.component.html',
    styleUrls: ['./css/settings.component.css']
})
export class Settings {

    downloadlocation : string;

    address: string = "irc.rizon.net";
    channels: string = "#nibl,#horriblesubs,#news";
    username : string = "";
    connectionStatus : string = "Disconnected.";
    localStorageKeys : string[];
    localStorageData : string;
    localStorageSelected : string;

    /**
     * Creates an instance of Settings.
     * @param {BackEndService} backEndService (used for communicating with the backend)
     * @param {ShareService} shareService (used for sharing and retreiving information with other components & services)
     * @param {SemanticService} semanticui (used for manipulating dom elements for SemanticUI CSS Framework through jQuery)
     * @memberof Settings
     */
    constructor(private backEndService: BackEndService, private shareService: ShareService, private semanticui : SemanticService){
        this.downloadlocation = "Waiting for back-end";
        this.localStorageKeys = [];
        this.localStorageData = "";
        this.localStorageSelected = "";
    }

    /**
     * Listens to messages from the back-end and determines if the back-end has made a succesful connnection with the IRC Server.
     * Retreives the current download directory used by the back-end.
     * Gets the current settings stored for Custom IRC Connection if it exists within localstorage.
     * 
     * @memberof Settings
     */
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

        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
            this.localStorageKeys.push(localStorage.key( i ));
        }
        
        this.semanticui.enableAccordion();
        this.semanticui.enableDropDown();

    }

    /**
     * Opens extra component called filedialog.component.ts 
     * 
     * @memberof Settings
     */
    openFileDialog(){    
        this.shareService.showFileDialog();
    }

    /**
    * Sets up a custom irc connection with user defined settings for IRC Server, Channel & Username
    * Stores it using LocalStorage
    * 
    * @memberof Settings
    */
    setCustomConnection(){
        let newConnection = {address : this.address, channels: this.channels, username: this.username};
        this.shareService.storeDataLocal("custom_irc_connection", JSON.stringify(newConnection));
        this.connectToIrcServer();
    }

    /**
     * Tells the back-end to connect to the irc server using the settings defined by the user, or if not defined, the default irc settings.
     * 
     * @memberof Settings
     */
    connectToIrcServer(){
        this.backEndService.sendMessage({"action" : "connect_irc", "extra" : {address : this.address, channels: this.channels, username: this.username}});
    }

    /**
     * Tells the back-end to close the connection with the irc server.
     * 
     * @memberof Settings
     */
    disconnectIrcServer(){
        this.backEndService.sendMessage({"action" : "disconnect_irc"});
    }

    /**
     * Resets the IRC settings defined by the user to default:
     * address: irc.rizon.net
     * channels: #nibl,#horriblesubs,#news
     * username: "" = let backend generate username
     * @memberof Settings
     */
    setDefaultConnection(){
        let newConnection = {address : "irc.rizon.net", channels: "#nibl, #horriblesubs, #news", username: ""};
        this.address = newConnection.address;
        this.channels = newConnection.channels;
        this.username = newConnection.username;
        this.shareService.storeDataLocal("custom_irc_connection", JSON.stringify(newConnection));
        this.connectToIrcServer();
    }

    /**
     * Retreives data stored within localstorage for provided key, then shows it.
     * 
     * @param {string} key (key to retreive from local storage)
     * @memberof Settings
     */
    showKey(key :string){
        this.localStorageSelected = key;
        let localstoragedata = this.shareService.getDataLocal(key).toString();
        try{

            this.localStorageData = JSON.stringify(JSON.parse(localstoragedata), undefined, 4);
        } catch(e){
            this.localStorageData = localstoragedata;
        }
    }

    /**
     * Resets the selected storage
     * 
     * @memberof Settings
     */
    resetStorage(){
        if(this.localStorageSelected != ""){
            localStorage.removeItem(this.localStorageSelected);
            this.localStorageKeys = [];
            this.localStorageData = "";
            this.localStorageSelected = "";
            for ( var i = 0, len = localStorage.length; i < len; ++i ) {
                this.localStorageKeys.push(localStorage.key( i ));
            }
        }       
    }


    
}