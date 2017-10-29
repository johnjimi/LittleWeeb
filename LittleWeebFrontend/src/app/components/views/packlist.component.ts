import {Component, OnInit, OnDestroy} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {NiblService} from '../../services/nibl.service'
import {UtilityService} from '../../services/utility.service'
import {SemanticService} from '../../services/semanticui.service'
import {BackEndService} from '../../services/backend.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
@Component({
    selector: 'packlist',
    template: `
                <div class="ui horizontal divider" id="animeTitle">Pack List - {{title}}</div>
                <div class="ui active centered inline inverted dimmer" style="display:none;" id="animeLoading" >
                <div class="ui text loader">Loading</div>
                </div>
                <div class="row" *ngIf="showError">
                    <h2> No packs found, please go back and select a anime!</h2>
                </div>
                <div class="row" *ngIf="showList">
                    <div class="ui selection dropdown" style="width: 10%;">
                        <input type="hidden" name="botanime"  style="width: 10%;">
                        <i class="dropdown icon"></i>
                        <div class="default text">All Bots</div>
                        <div class="menu botlist" style="min-width: 10%;" >  
                            <div class="item" (click)="showBot('all')" >All Bots</div>
                            <div class="item" *ngFor="let bot of botList"  (click)="showBot(bot)"  >{{bot}}</div>
                        </div>
                    </div>
                    <div class="ui selection dropdown" style="width: 10%;"  >
                        <input type="hidden" name="resolutionAnime"  style="width: 10%;">
                        <i class="dropdown icon"></i>
                        <div class="default text">All Resolutions</div>
                        <div class="menu" style="min-width: 10%;">                
                        <div class="item active" (click)="showResolution('all')">All Resolutions</div>
                        <div class="item" (click)="showResolution('480')" >480p</div>
                        <div class="item" (click)="showResolution('720')" >720p</div>
                        <div class="item" (click)="showResolution('1080')" >1080p</div>
                        </div>
                    </div>
                    <button class="ui primary button" (click)="showAll()"> Show all episodes </button>
                    <button class="ui primary button" (click)="closeAll()"> Close all episodes </button>
                    <button class="ui primary button" (click)="batchAll()"> Download All Episodes (Experimental!) </button>
                </div>
                <div class="divider ui"></div>
                <div class="row">
                    <div class="row multipleselected" id="multipleselected" *ngIf="packsSelected">
                        <p>             
                        <button class="ui primary button" style="width: 100%" (click)="appendToDownloads()"> Append selected to download list. </button>
                        </p>
                        <br>
                    </div>
                    <div class="ui styled accordion" id="packs" style=" width: 100%; ">
                        <div *ngFor="let episodes of episodeList; let i=index"  >
                            <div class="title" id="{{i}}" *ngIf="episodes !== undefined">
                                <i class="dropdown icon"></i>
                                <div class="ui checkbox">
                                    <input type="checkbox" class="' + i + '"  (click)="selectBestEpisode(i)" />
                                    <label>Episode {{i}}</label>
                                </div>
                            </div>
                            <div class="content" *ngIf="episodes !== undefined">
                                <div class="ui styled accordion" id="packs" style=" width: 100%; ">
                                    <div *ngFor="let episode of episodes; let b=index" >
                                        <ng-container *ngIf="episode.name.indexOf(resolution) > -1 || showAllResolutions">
                                            <ng-container *ngIf="episode.botId.indexOf(botname) > -1 || showAllBots"> 
                                                <div class="title" >
                                                    <i class="dropdown icon"></i>
                                                    <div class="ui checkbox">
                                                        <input type="checkbox" class="' + b + '"  (click)="aCheckBoxChecked(episode)" />
                                                        <label>{{episode.botId}} | {{episode.name}} | {{episode.size}}b</label>
                                                    </div>
                                                </div>                                         
                                            </ng-container>
                                        </ng-container>
                                    </div>    
                                </div>  
                            </div>
                        </div>  
                    </div>                          
                    <div class="ui divider"> </div>   
                     <div class="ui styled accordion" id="packs" style=" width: 100%; " *ngIf="movieList.length > 0" >
                        <div class="title" id="movie">
                            <i class="dropdown icon"></i>
                            <div class="ui checkbox">
                                <input type="checkbox" class="movie"  (click)="selectBestMovie()" />
                                <label>Movie</label>
                            </div>
                        </div>
                        <div class="content">
                            <div class="ui styled accordion" id="moviepacks" style=" width: 100%; ">
                                <div *ngFor="let movie of movieList; let b=index" >
                                    <ng-container *ngIf="movie.name.indexOf(resolution) > -1 || showAllResolutions">
                                        <ng-container *ngIf="movie.botId.indexOf(botname) > -1 || showAllBots"> 
                                            <div class="title" >
                                                <i class="dropdown icon"></i>
                                                <div class="ui checkbox">
                                                    <input type="checkbox" class="' + b + '"  (click)="aCheckBoxChecked(movie)" />
                                                    <label>{{movie.botId}} | {{movie.name}} | {{movie.size}}b</label>
                                                </div>
                                            </div>                                           
                                        </ng-container>
                                    </ng-container>
                                </div>    
                            </div>  
                        </div>
                    </div>       
                </div>
                <script>                 
                    $('.ui.accordion').accordion();
                    $('.ui.dropdown').dropdown();
                </script>
    `
})
export class PackList {

    packlistfinal : any[];
    botList : any[];
    botname : string;
    resolution : string;
    showAllBots : boolean;
    showAllResolutions : boolean;
    itemsPerPage : number;
    page : number;
    selectedItems : any[];
    packsSelected :boolean;
    title : string;
    episodeList: any[];
    movieList: any[];
    prefferedbots : string[];
    showList : boolean;
    showError : boolean;

    //this component shows a list with packs, it handles batch selecting, best episode/movie selecting, bot and resolution filtering as well as finding anime episodes that are named a bit differently

    constructor(private shareService: ShareService, private niblService:NiblService, private utilityService: UtilityService, private semanticui : SemanticService, private backEndService: BackEndService){
        console.log("initianted pakclist");
        this.botname = "all";
        this.showAllBots = true;
        this.showAllResolutions = true;
        this.itemsPerPage = 100;
        this.page = 0;
        this.packlistfinal = [[{botId : "0", name: "0"}]];
        this.packsSelected = false;
        this.selectedItems = [];
        this.title = "";
        this.episodeList= new Array();
        this.movieList = new Array();
        this.showList = false;
        this.showError = false;
        this.botList = new Array();
        this.prefferedbots  = ["CR-HOLLAND|NEW", "CR-AMSTERDAM|NEW", "CR-FRANCE|NEW", "Ginpachi-Sensei", "Cerebrate"];
        

        this.shareService.animetitlesub.subscribe((anime) => {
                console.log("got mah anime");
                console.log(anime);
                if(anime !== undefined){
                    this.showPackListFor(anime);
                }
        }); 
    }

    //shows all the available episodes for x anime, has logic to request files with synonyms as well, has logic  to parse episode title so only the essence(the title) is used for checking
    async showPackListFor(anime : any){
        
        try{
            var bots = await this.niblService.getBotListSync();
            var synonyms = [];
            
            this.title = anime.title_english;
            
            console.log(anime);
            if(anime.synonyms !== undefined){
                if(anime.synonyms[0] != ""){
                    synonyms = anime.synonyms;
                }
            }
            if(anime.title_english !== undefined){
                if(synonyms.indexOf(anime.title_english) == -1 ){
                    synonyms.push(anime.title_english);
                }
            }
            if(anime.title_romaji !== undefined){
                if( synonyms.indexOf(anime.title_romaji) == -1){
                    synonyms.push(anime.title_romaji);
                }
            }
            
            let animePacks = [{id : "", botId : "", name : ""}];
            for(let synonym of synonyms){
                synonym = this.utilityService.stripName(synonym);
                if(synonym.length > 0){
                    var json = await this.niblService.getSearchAnimeResultsSync(synonym);
                    if(json.length > 0){
                        for(let pack of json){
                            var stripped = this.utilityService.stripName(pack.name);
                            if(this.utilityService.compareNames(synonym, stripped) > 90 && (synonym.length - stripped.length) < 10){
                                var exists = false;
                                var episodenumber = this.utilityService.getEpisodeNumber(pack.name);
                                
                                for(let temppack of animePacks){
                                    if(temppack.id == pack.id && temppack.botId == pack.botId && temppack.name == pack.name){
                                        exists = true;
                                        break;
                                    }
                                }
                                if(!exists){

                                    for(let bot of bots){
                                        if(bot.id == pack.botId){
                                            pack.botId = bot.name;
                                            if(this.botList.indexOf(bot.name) == -1 && bot.name.indexOf("v6") == -1){
                                                this.botList.push(bot.name);
                                            }
                                        }
                                    }

                                    if(anime.type.toLowerCase() == "movie" || episodenumber == "" && pack.name.indexOf("v6") == -1){
                                        try{
                                            this.movieList.push(pack);
                                        } catch(e){
                                            this.movieList = new Array();
                                            this.movieList.push(pack); 
                                        }

                                    } else if( pack.name.indexOf("v6") == -1){
                                        try{
                                            this.episodeList[parseInt(episodenumber)].push(pack);
                                            if(this.episodeList[parseInt(episodenumber)][0].id == ""){
                                                this.episodeList[parseInt(episodenumber)].splice(0,1);
                                            }
                                        } catch(e){
                                            this.episodeList[parseInt(episodenumber)] = new Array();
                                            this.episodeList[parseInt(episodenumber)].push(pack); 
                                            if(this.episodeList[parseInt(episodenumber)][0].id == ""){
                                                this.episodeList[parseInt(episodenumber)].splice(0,1);
                                            }
                                        }
                                    }                                   
                                }
                            }                     
                        }
                    }   
                }                          
            }

            if((this.episodeList.length > 0) ||(this.movieList.length > 0) ) {
                this.showList = true;
            } else {
                this.showError = true;
            }
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown();

           
        } catch (E){
            this.showError= true;
            console.log(E);
        }
        
        
       
     
    }

    //show all episodes
    showAll(){
        var i = 0;
        for(let episodes in this.episodeList){
            
            this.semanticui.openAccordion('#' + i);
            i++;
        }
    }

    //close all episodes
    closeAll(){
        var i = 0;
        for(let episodes in this.episodeList){
            
            this.semanticui.closeAccordion('#' + i);
            i++;
        }
    }    
    
    //experimental batch downloading it should work... technically
    batchAll(){
        var i = 0;
        for(let episodes of this.episodeList){
            this.selectBestEpisode(i);
            i++;
        }
    }

    //select the best episode 
    selectBestEpisode(i:number){
        console.log("gotta setup that episode selector logic here");

        var episodeversions = this.episodeList[i];
      
        for(let episode of episodeversions){
            var foundBestBotMatch = false;
            for(let botname of this.prefferedbots){
                console.log(botname);
                if(this.resolution !== undefined){
                    console.log("CHECKING FOR RESOLUTION " + this.resolution);
                    if(episode.botId.indexOf(botname) > -1 && episode.name.indexOf(this.resolution) > -1){
                         this.checkIfPackIsInSelected(episode);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        foundBestBotMatch = true;
                        console.log("FOUND BEST EPISODE MATCH:");
                        console.log(episode);
                        return;
                    }

                } else {
                    //default resolution = 720p (will be user changeable in the future)
                   
                    if(episode.botId.indexOf(botname) > -1 && episode.name.indexOf("720") > -1){
                         console.log("CHECKING FOR RESOLUTION  720" );
                         this.checkIfPackIsInSelected(episode);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        foundBestBotMatch = true;
                        console.log("FOUND BEST EPISODE MATCH:");
                        console.log(episode);
                        return;
                    } else if(episode.botId.indexOf(botname) > -1){ //select first item thats there (probably only used if there isn't a filename available that specifies a resolution)
                         console.log("NOT CHECKING RESOLUTION" );    
                        this.checkIfPackIsInSelected(episode);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        foundBestBotMatch = true;
                        console.log("FOUND BEST EPISODE MATCH:");
                        console.log(episode);
                        return;
                    }

                }
                
            }
            if(!foundBestBotMatch){ //if none of the bots are available, select first available episode!
                 if(this.resolution !== undefined){
                    if(episode.name.indexOf(this.resolution) > -1){
                         this.checkIfPackIsInSelected(episode);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        console.log("FOUND BEST EPISODE MATCH:");
                        console.log(episode);
                        return;
                    }

                } else {
                    //default resolution = 720p (will be user changeable in the future)
                    if(episode.name.indexOf("720") > -1){
                         this.checkIfPackIsInSelected(episode);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        console.log("FOUND BEST EPISODE MATCH:");
                        console.log(episode);
                        return;
                    } else { //select first item thats there (probably only used if there isn't a filename available that specifies a resolution)
                        this.checkIfPackIsInSelected(episode);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        console.log("FOUND BEST EPISODE MATCH:");
                        console.log(episode);
                        return;
                    }

                }
            }
        }

    }

    //select the best movie
    selectBestMovie(){
         for(let movie of this.movieList){
            var foundBestBotMatch = false;
            for(let botname of this.prefferedbots){
                if(this.resolution !== undefined){
                    if(movie.botId.indexOf(botname) > -1 && movie.name.indexOf(this.resolution) > -1){
                        this.checkIfPackIsInSelected(movie);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        foundBestBotMatch = true;
                        console.log("FOUND BEST MOVIE MATCH:");
                        console.log(movie);
                        return;
                    }

                } else {
                    //default resolution = 720p (will be user changeable in the future)
                    if(movie.botId.indexOf(botname) > -1 && movie.name.indexOf("720") > -1){
                        this.checkIfPackIsInSelected(movie);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        foundBestBotMatch = true;
                        console.log("FOUND BEST MOVIE MATCH:");
                        console.log(movie);
                        return;
                    } else if(movie.botId.indexOf(botname) > -1){ //select first item thats there (probably only used if there isn't a filename available that specifies a resolution)
                        this.checkIfPackIsInSelected(movie);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        foundBestBotMatch = true;
                        console.log("FOUND BEST MOVIE MATCH:");
                        console.log(movie);
                        return;
                    }

                }
            }

            if(!foundBestBotMatch){ //if none of the bots are available, select first available episode!
                 if(this.resolution !== undefined){
                    if(movie.name.indexOf(this.resolution) > -1){
                        this.checkIfPackIsInSelected(movie);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        console.log("FOUND BEST MOVIE MATCH:");
                        console.log(movie);
                        return;
                    }

                } else {
                    //default resolution = 720p (will be user changeable in the future)
                    if(movie.name.indexOf("720") > -1){
                        this.checkIfPackIsInSelected(movie);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        console.log("FOUND BEST MOVIE MATCH:");
                        console.log(movie);
                        return;
                    } else { //select first item thats there (probably only used if there isn't a filename available that specifies a resolution)
                        this.checkIfPackIsInSelected(movie);
        
                        if(this.selectedItems.length > 0){
                            this.packsSelected = true;
                        } else {
                            this.packsSelected = false;
                        }
                        console.log("FOUND BEST MOVIE MATCH:");
                        console.log(movie);
                        return;
                    }
                }
            }
         }
    }

    //to show only episodes for a certain bot
    showBot(bot: string){
        if(bot == "all"){
            //every filename has a dot for extension
            this.showAllBots = true;
            this.botname = undefined;
        } else {
            this.showAllBots = false;
            this.botname = bot;
        }
    }

    //to show only episodes with a certain resolution
    showResolution(res: string){
        if(res == "all"){
            //every filename has a dot for extension
            this.showAllResolutions = true;
            this.resolution = undefined;
        } else {
            this.showAllResolutions = false;
            this.resolution = res;
        }
    }

    //adds pack to a list with selected episodes, only when the episode  doesn't exists
    checkIfPackIsInSelected(pack: Object){
         var checkIfExists = this.selectedItems.indexOf(pack);
        if(checkIfExists == -1){            
            this.selectedItems.push(pack);
            console.log("added pack: ");
            console.log(pack);
        } else {
            this.selectedItems.splice(checkIfExists, 1);            
            console.log("removed pack at index: ");
            console.log(checkIfExists);
            console.log(pack);
        }
    }

    //checks a checkbox
    aCheckBoxChecked(pack: Object){
        this.checkIfPackIsInSelected(pack);
        
        if(this.selectedItems.length > 0){
            this.packsSelected = true;
        } else {
            this.packsSelected = false;
        }
    }

    //append all selected episodes to the download que
    appendToDownloads(){
        var listWithDownloads = [];

        for(let download of this.selectedItems){
            console.log(download);
            var genid = this.utilityService.generateId(download.botId, download.number);
            var newObj = {id : genid, pack : download.number, bot: download.botId, filename: download.name, status : "Waiting", progress : "0", speed : "0"};
            //this should technically be done in the downloads.component, but due to weird issues with CefSharp it sometimes doesn't trigger the event :(
            //this.backEndService.sendMessage("AddToDownloads:" + genid + ":" + download.number + ":" + download.botId);
            this.shareService.appendNewDownload(newObj);
        }


    }
}
