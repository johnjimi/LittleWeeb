import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {ShareService} from '../../services/share.service'
import {NiblService} from '../../services/nibl.service'
import {UtilityService} from '../../services/utility.service'
import {SemanticService} from '../../services/semanticui.service'
import {BackEndService} from '../../services/backend.service'
import {MalService} from '../../services/mal.service'
import {DownloadService} from '../../services/download.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
@Component({
    selector: 'packlist',
    template: `
                <div class="ui horizontal divider" id="animeTitle">Pack List - {{title}}</div>
                <div class="row" style="text-align: center;" *ngIf="showError">
                        <h2> No episodes found, please go back and select a anime!</h2>
                         <h3> If this messages shows when you try to view a second season, try looking at the first season!</h3>
                         <br />
                         Due to the way some releasers name their episodes, some episodes can't be categorized in two seperate seasons! 
                         <br />
                         For example: There has not been a sub group that releases Fate/Zero seperate as First Season and Second Season, so most likely the second seasons 
                         <br />
                         episodes are listed under the first season!
                </div>
                <div class="row" *ngIf="showList" >
                    <div class="ui link cards">
                        <div class="card"style="max-width: 25%;">
                            <div class="image">
                            <img [src]="this.animeInfo.image_url">
                            </div>
                            <div class="content">
                            <div class="header">{{this.animeInfo.title}}</div>
                            <div class="meta">
                                <a>Genres</a>
                            </div>
                            <div class="description">
                                <div *ngFor="let genre of this.animeInfo.genres">
                                    {{genre}},
                                </div>
                            </div>
                            </div>
                            <div class="extra content">
                            <span class="right floated">
                            <i class="users icon"></i>
                                {{this.animeInfo.members_count}} Members 
                            </span>
                            <span>
                                <i class="star icon"></i>
                                Score {{this.animeInfo.members_score}} 
                            </span>
                            </div>
                        </div>
                        <div class="card" style="min-width: 70%;">
                            <div class="image" style=" position:relative; min-width: 70%;  min-height:70%;">
                            <iframe  style="position: absolute; height: 100%; width: 100%;" [src]="this.animeInfo.preview  | safe" frameborder="0">
                            </iframe>
                            </div>
                            <div class="content">
                            <div class="header">Synopsis</div>
                            <div class="meta">
                                <span class="date"></span>
                            </div>
                            <div class="description" style="max-height: 60px; overflow-y:scroll;" [innerHtml]="this.animeInfo.synopsis">
                            </div>
                            </div>
                            <div class="extra content">
                            <span class="right floated">
                                <i class="file video outline icon"></i>
                                Episodes: {{this.animeInfo.episodes}}
                            </span>
                            <span>
                                <i class="television icon"></i>
                                Type: {{this.animeInfo.type}}
                            </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="divider ui"></div>
                <div class="row" *ngIf="showList">
                    <div class="ui selection dropdown" style="width: 7%;">
                        <input type="hidden" name="botanime"  style="width: 7%;">
                        <i class="dropdown icon"></i>
                        <div class="default text">All Bots</div>
                        <div class="menu botlist" style="min-width: 7%;" >  
                            <div class="item" (click)="showBot('all')" >All Bots</div>
                            <div class="item" *ngFor="let bot of botList"  (click)="showBot(bot)"  >{{bot}}</div>
                        </div>
                    </div>
                    <div class="ui selection dropdown" style="width: 7%;"  >
                        <input type="hidden" name="resolutionAnime"  style="width:7%;">
                        <i class="dropdown icon"></i>
                        <div class="default text">All Resolutions</div>
                        <div class="menu" style="min-width: 7%;">                
                            <div class="item active" (click)="showResolution('all')">All Resolutions</div>
                            <div class="item" (click)="showResolution('480')" >480p</div>
                            <div class="item" (click)="showResolution('720')" >720p</div>
                            <div class="item" (click)="showResolution('1080')" >1080p</div>
                        </div>
                    </div>
                    <button class="ui inverted blue button" (click)="showAll()"> Show all </button>
                    <button class="ui inverted blue button" (click)="closeAll()"> Close all</button>
                    <button class="ui inverted blue button" (click)="batchAll()"> Download Full Anime (Experimental!)</button>
                </div>
                <div class="divider ui"></div>
                <div class="row">                    
                    <div class="ui styled accordion episodeList" id="packs" style=" width: 100%; ">
                        <div *ngFor="let episodes of episodeList.slice().reverse() ; let i=index; let last = last;"  >
                            <div class="title" id="{{(episodeList.length - i - 1)}}" *ngIf="episodes !== undefined">
                                <i class="dropdown icon"></i>
                                <div class="ui checkbox">
                                    <input type="checkbox" class="' + i + '"  (click)="selectBestEpisode(i)" /> 
                                    <label>Episode {{(episodeList.length - i - 1)}}</label>
                                </div>
                            </div>
                            <div class="content" *ngIf="episodes !== undefined">
                                 

                                 <table class="ui very basic table" style="width: 100%; background-color: white;">
                                    <thead>
                                        <tr>
                                        <th style="width: 20%;">Batch Select</th>
                                        <th style="width: 20%;">Download</th>
                                        <th style="width: 20%;">Bot</th>
                                        <th style="width: 20%;">Filename</th>
                                        <th style="width: 20%;">FileSize</th>
                                        </tr>
                                    </thead>
                                    <tbody id="listWithFiles">
                                        <tr *ngFor="let episode of episodes; let b=index">
                                            <ng-container *ngIf="episode.name.indexOf(resolution) > -1 || showAllResolutions">
                                                <ng-container *ngIf="episode.botId.indexOf(botname) > -1 || showAllBots"> 
                                                    <td>
                                                        <input type="checkbox" class="' + b + ' "  (click)="aCheckBoxChecked(episode)" /> 
                                                    </td>
                                                    <td> 
                                                        <button class="ui green inverted button" (click)="appendToDownloadsDirectly(episode)"> Download </button>
                                                    </td>
                                                    <td>{{episode.botId}}</td>
                                                    <td>{{episode.name}}</td>
                                                    <td>{{episode.size}}</td>                  
                                                </ng-container>
                                            </ng-container>
                                        </tr>                 
                                    </tbody>
                                </table>
                            </div>
                            {{last ? stopLoading(i) : ''}}
                        </div>  
                    </div>                          
                    <div class="ui divider"> </div>   
                     <div class="ui styled accordion" id="packs" style=" width: 100%; " *ngIf="movieList.length > 0" >
                        <div class="title" id="movie">
                            <i class="dropdown icon"></i>
                            <div class="ui checkbox">
                                <input type="checkbox" class="movie"  (click)="selectBestMovie()" />
                                <label>Movie, OVA's, ONA's, etc...</label>
                            </div>
                        </div>
                        <div class="content">
                            <div class="ui styled accordion movieList" id="moviepacks" style=" width: 100%; ">
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
                <div class="eleven wide column"  style=" width: 100%; position: fixed; bottom:0; background-color: white;" *ngIf="packsSelected" >
                             
                   <button class="ui inverted blue button" style=" width: 100%; " (click)="appendToDownloads()"> Start Batch Download of {{selectedItems.length}} downloads</button>
                    
                </div>
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

    //information view
    animeInfo : any;



    //this component shows a list with packs, it handles batch selecting, best episode/movie selecting, bot and resolution filtering as well as finding anime episodes that are named a bit differently

    constructor(private router: Router, private downloadService : DownloadService, private malService: MalService, private shareService: ShareService, private niblService:NiblService, private utilityService: UtilityService, private semanticui : SemanticService, private backEndService: BackEndService){
        console.log("initianted packlist");
        this.botname = "all";
        this.showAllBots = true;
        this.showAllResolutions = true;
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

        
        this.shareService.animetitlesub.take(1).subscribe(async(anime) => {
                console.log("got mah anime");
                console.log(anime);
                if(anime !== null){
                    this.shareService.showLoaderMessage("Loading anime: " + anime.title );                    
                    this.showPackListFor(anime);
                } else {
                    this.title = "No episodes found!";
                    this.showError = true;
                    this.stopLoading(0);
                }
        }); 
    }

   
    //shows all the available episodes for x anime, has logic to request files with synonyms as well, has logic  to parse episode title so only the essence(the title) is used for checking
    async showPackListFor(anime : any){
        this.showList = false; 
        this.showError = false;
        var shouldParse = false;
        if(this.shareService.getStoredAnimeToView() != null){
            if(anime != null){
                if(anime.id == this.shareService.getStoredAnimeToView().id){
                    this.animeInfo = this.shareService.getStoredAnimeToView();
                    this.episodeList = this.shareService.getStoredEpisodesToView();
                } else {                
                    this.animeInfo = await this.malService.getAnimeInfo(anime.id.toString());
                    anime = this.animeInfo;
                    shouldParse = true;
                }
            } else {
                this.animeInfo  = this.shareService.getStoredAnimeToView();
                this.episodeList = this.shareService.getStoredEpisodesToView();
                
            }         
            
            this.semanticui.enableAccordion();
            this.semanticui.enableDropDown();
            this.showError = false;
            this.showList = true; 
            
        } else if(anime != null) {
            this.animeInfo = await this.malService.getAnimeInfo(anime.id.toString());
            anime = this.animeInfo;
            shouldParse = true;
            this.showError = false;
        } else {
            shouldParse = false;
            this.showError = true;
            this.showList = false; 
        }
        if(shouldParse){
            
            this.shareService.showLoaderMessage("Loading anime: " + anime.title ); 
            this.episodeList= new Array();
            this.movieList = new Array();
            anime = this.animeInfo;
            console.log("Running packlist parser for: " + anime.title);
            //synonym list 

            
            var synonyms = [anime.title];
            //find every english synonym about anime:
            for(let othertitles in anime.other_titles.english){

                var englishTitle = anime.other_titles.english[othertitles];
                
                this.shareService.showLoaderMessage("Retreiving synonym: " + englishTitle );
                synonyms.push(englishTitle);
            }
            //find every other synonym about anime:
            for(let othertitles in anime.other_titles.synonyms){
                var synonymsTitle = anime.other_titles.synonyms[othertitles];
                
                this.shareService.showLoaderMessage("Retreiving synonym: " + synonymsTitle );
                synonyms.push(synonymsTitle);
            }

            //create stripped synonyms array
            var strippedSynonyms = [];

            //determine which season the anime belongs to
            var secondSeasonIdentifiers = ["second season", "second", "2nd", " 2", "2nd season", "s2",  "ii"];
            var thirdSeasonIdentifiers = ["third season", "third", "3rd", " 3", "3rd season", "s3",  "iii"];        
            var fourthSeasonIdentifiers = ["fourth season", "fourth", "4th", " 4", "4rd season", "s4",  "iv"];
            var seasonsIdentifiers = [secondSeasonIdentifiers, thirdSeasonIdentifiers, fourthSeasonIdentifiers];

            //checks if title of each synonym contains one of the above identifiers, and returns as soon it's found one. 
            var seasonCounter = 2;
            var seasonFound = false;
        
            this.shareService.showLoaderMessage("Determening season." );
            for(let whichSeason of seasonsIdentifiers){
                if(seasonFound){
                    break;
                }            
                for(let seasonIdentifiers of seasonsIdentifiers){
                    if(seasonFound){
                        break;
                    }
                    for(let seasonIdentifier of seasonIdentifiers){
                        if(seasonFound){
                            break;
                        }
                        for(let synonym of synonyms){
                            try{
                                var words = synonym.split(' ');
                                if(seasonFound){
                                    break;
                                }
                                for(let word of words){
                                    if(word.toLowerCase().indexOf(seasonIdentifier) != -1){
                                        console.log("Anime " + anime.title + " is season " + seasonCounter + " because: '" + word + "' equals to '" + seasonIdentifier + "'");
                                        seasonFound = true;
                                        break;
                                    }
                                }
                            }catch(E){
                                console.log(E);
                                seasonFound = false;
                                break;
                            }
                            
                        }
                    }                
                    seasonCounter++;
                }
                
            }

            
            this.shareService.showLoaderMessage("Season is: Season " + (seasonCounter-1));

            //if no identifiers were found, its almost sure that it's a first season, or it does have multiple seasons, but hasn't been released as such
            

            var episodeCountPreviousSeason;
            if(!seasonFound){
                console.log("Anime " + anime.title + " is season 1 ");
                seasonCounter = 1;
                for(let title of synonyms){
                    try{
                        strippedSynonyms.push(this.utilityService.stripName(title));
                    }catch(e){}
                }
            } else {

                for(let title of synonyms){
                    try{

                        console.log(title);
                        var newsyn = title.toLowerCase();
                        for(let seasonIdentifier of seasonsIdentifiers[seasonCounter - 3]){
                            if(seasonIdentifier.indexOf(' ') != -1){
                                var splitter1 = seasonIdentifier.split(' ')[0];
                                var splitter2 = seasonIdentifier.split(' ')[1];
                                newsyn = newsyn.toLowerCase().replace(splitter1, "");
                                newsyn = newsyn.toLowerCase().replace(splitter2, "");
                            } else {
                                newsyn = newsyn.toLowerCase().replace(seasonIdentifier, "");
                            }
                        }   
                        console.log(newsyn.trim());
                        if(newsyn.trim() != ""){                            
                            strippedSynonyms.push(this.utilityService.stripName(newsyn.trim()));
                        }
                    } catch (E){
                        
                    }

                }
                console.log("prequel: " + anime.prequels[0].anime_id);
                episodeCountPreviousSeason = await this.malService.getAnimeInfo(anime.prequels[0].anime_id);
            }

            
            this.shareService.showLoaderMessage("Generated " + strippedSynonyms.length + " search queries. ");

            console.log(strippedSynonyms);
            //getting all bots available, in the next for loops used to compare to the found files, so that only the bots which contain the files are shown.
            var bots = await this.niblService.getBotListSync();

            
            //makes it easier on the loop for getting the bot (Doesn't have to roll through the botlist over and over for each file)
            var botsWithId = {};

            //appends botname to index botid
            for(let bot of bots){
                botsWithId[bot.id] = bot.name;
            }

            this.stopLoading(0);
            this.shareService.showLoaderMessage("Retreived " + bots.length + " amount of bots. ");

            var addedFileIds = [];

            var tempListEpisodeList = [];
            strippedSynonyms = strippedSynonyms.filter(Boolean).filter(function(val,ind) { return strippedSynonyms.indexOf(val) == ind; }); //filter empty and duplicates
            //getting packs from server
            try{
                var strippedSynonymsIndex = 1;
                for(let synonym of strippedSynonyms){  
                    
                    this.stopLoading(0);
                    this.shareService.showLoaderMessage("Search query " + strippedSynonymsIndex + " of " + strippedSynonyms.length + " executing.");                                                                                                     //go trough each synonym.
                    var filesFound = await this.niblService.getSearchAnimeResultsSync(synonym);                                                
                    if(filesFound.length > 0){                                                                                                              //make sure there are actual files to parse (not null)
                        for(let file of filesFound){                                                                                                        //go through each file
                            if(this.utilityService.compareNames(this.utilityService.stripName(file.name), synonym) >=30){                                                                  //compare filename with synonym
                                                                            //season is either first season or a combined season.
                                var botname = botsWithId[file.botId];                                                                           //get name of bot where file is stored
                            
                                if(botname === undefined){
                                    botname = "Unknown - these files cannot be downloaded!";
                                }
                                if(this.botList.indexOf(botname) == -1){                                                                        //check botname exists in botlist
                                    this.botList.push(botname);                                                                                 //appends botname to botlist
                                } 
                                file.botId = botname;                                                                                           //replace id code for bot with botname
                                var fileid =  file.number.toString() + "_" + file.botId.toString()  + "_" + file.episodeNumber.toString();      //create unique fileid (which is always the same for the same file on the same bot with the same episode number)
                                var episodenumber = file.episodeNumber;                                                                         //get episode number
                                if(addedFileIds.indexOf(fileid) == -1){                                  //check if the file has not already been added (to counter duplicates) and file episode number does not exceed max episodes for anime (+1 due to some episodes having episode zero as well.)
                                    addedFileIds.push(fileid);                                                                                  //add fileid to fileidlist
                                    try{
                                        if(anime.type.toLowerCase() == "movie" || episodenumber == -1){                                         //check if anime is a movie
                                            this.movieList.push(file);                                                                          //append file to the movie list
                                        } else {                                                                                                //if it isn't a movie
                                            tempListEpisodeList[parseInt(episodenumber)].push(file);                                               //append file to the rigth episode index         
                                        }                                                        
                                    } catch(e){
                                        if(anime.type.toLowerCase() == "movie" || episodenumber == -1){                                         //check if anime is a movie
                                            this.movieList = new Array();                                                                       //create new array in case it hasn't been initiated
                                            this.movieList.push(file);                                                                          //append file to movie list
                                        } else {                                                                                                //if it isn't a movie
                                            tempListEpisodeList[parseInt(episodenumber)] = [];                                                     //create new array in case it hasn't been initiated
                                            tempListEpisodeList[parseInt(episodenumber)].push(file);                                               //append file to the index defined by it's episode number.                                                
                                        }
                                    }                                        
                                }
                            } else {
                                console.log("Didnt add file: " + file.name + "(stripped:" + this.utilityService.stripName(file.name) + ") because it only matches " + this.utilityService.compareNames(this.utilityService.stripName(file.name), synonym) + "% with " + synonym );
                            }                    
                        }
                    }
                    strippedSynonymsIndex++;
                }


                this.stopLoading(0);
                this.shareService.showLoaderMessage("Parsing and ordering the files. ");     
                if( tempListEpisodeList.length != 0){

                    if(seasonFound){
                        console.log("This is not the first season :)");
                        var possibleFirstSeasonEpisodes = [];
                        var possibleOtherEpisodes = [];
                        if(episodeCountPreviousSeason.episodes != 0 && anime.episodes != 0){
                            
                            possibleFirstSeasonEpisodes = tempListEpisodeList.slice(0, episodeCountPreviousSeason.episodes + 1);
                            possibleOtherEpisodes = tempListEpisodeList.slice(episodeCountPreviousSeason.episodes);
                        } else {
                            possibleFirstSeasonEpisodes = tempListEpisodeList;
                        }
                        var i = 0;
                        for(i = 0; i < possibleFirstSeasonEpisodes.length; i++){
                            var episode = possibleFirstSeasonEpisodes[i];
                            if(episode !== undefined){
                                for(let file of episode){
                                    for(let seasonIdentifier of seasonsIdentifiers[seasonCounter - 3]){                                                     //go through each season identifiers.
                                        if(file.name.toLowerCase().indexOf(seasonIdentifier) != -1){                                                        //check if filename contains a season identifier
                                            var episodenumber = file.episodeNumber;
                                            try{
                                                if(anime.type.toLowerCase() == "movie" || episodenumber == -1){                                         //check if anime is a movie
                                                    this.movieList.push(file);                                                                          //append file to the movie list
                                                } else {                                                                                                //if it isn't a movie
                                                    this.episodeList[parseInt(episodenumber)].push(file);                                               //append file to the rigth episode index         
                                                }                                                        
                                            } catch(e){
                                                if(anime.type.toLowerCase() == "movie" || episodenumber == -1){                                         //check if anime is a movie
                                                    this.movieList = new Array();                                                                       //create new array in case it hasn't been initiated
                                                    this.movieList.push(file);                                                                          //append file to movie list
                                                } else {                                                                                                //if it isn't a movie
                                                    this.episodeList[parseInt(episodenumber)] = [];                                                     //create new array in case it hasn't been initiated
                                                    this.episodeList[parseInt(episodenumber)].push(file);                                               //append file to the index defined by it's episode number.                                                
                                                }
                                            }                       
                                        }
                                    }
                                }
                            }                        
                        }                   
                        for(i = 0; i < possibleOtherEpisodes.length; i++){
                            var episode = possibleOtherEpisodes[i];
                            if(episode !== undefined){
                                for(let file of episode){
                                    var episodenumber = file.episodeNumber;
                                    if(episodenumber >= (episodeCountPreviousSeason.episodes)){
                                    try{
                                            if(anime.type.toLowerCase() == "movie" || episodenumber == -1){                                         //check if anime is a movie
                                                this.movieList.push(file);                                                                          //append file to the movie list
                                            } else {                                                                                                //if it isn't a movie
                                                this.episodeList[parseInt(episodenumber)].push(file);                                               //append file to the rigth episode index         
                                            }                                                        
                                        } catch(e){
                                            if(anime.type.toLowerCase() == "movie" || episodenumber == -1){                                         //check if anime is a movie
                                                this.movieList = new Array();                                                                       //create new array in case it hasn't been initiated
                                                this.movieList.push(file);                                                                          //append file to movie list
                                            } else {                                                                                                //if it isn't a movie
                                                this.episodeList[parseInt(episodenumber)] = [];                                                     //create new array in case it hasn't been initiated
                                                this.episodeList[parseInt(episodenumber)].push(file);                                               //append file to the index defined by it's episode number.                                                
                                            }
                                        }             
                                    }
                                }
                            }                        
                        }                   
                    } else {
                        console.log("This is first season :)");
                        if(anime.episodes > 0){
                            var tempepisodes = [];
                            var i = 1;
                            for(i = 1; i < tempListEpisodeList.length; i++){
                                var episodes = tempListEpisodeList[i];
                                for(let episode of episodes){
                                    if(episode.episodeNumber <= anime.episodes){
                                        var isFirstSeason = true;
                                        for(let seasonIdentifiers of seasonsIdentifiers){
                                            for(let seasonIdentifier of seasonIdentifiers){
                                                if(episode.name.toLowerCase().indexOf(seasonIdentifier) != -1){
                                                    isFirstSeason = false;
                                                    break;
                                                }
                                            }
                                            if(!isFirstSeason){
                                                break;
                                            }
                                        }
                                        if(isFirstSeason){
                                            try{
                                                
                                                tempepisodes[parseInt(episode.episodeNumber)].push(episode);
                                            } catch (E){
                                                tempepisodes[parseInt(episode.episodeNumber)] = [];
                                                tempepisodes[parseInt(episode.episodeNumber)].push(episode);
                                            }
                                        }
                                    }
                                }
                            }
                            this.episodeList = tempepisodes;
                        }else {
                            this.episodeList = tempListEpisodeList;
                        }
                        
                    }
                    this.shareService.storeAnimeToView(anime, this.episodeList);
                    this.semanticui.enableAccordion();
                    this.semanticui.enableDropDown();
                    this.showList = true; 
                    
                    this.stopLoading(0);
                    
                    this.stopLoading(0);
                    
                } else {
                    this.showError = true;
                    
                    this.stopLoading(0);
                }
        
            } catch (e){
                this.semanticui.enableAccordion();
                this.semanticui.enableDropDown();
                this.showError = true;
                
                    this.stopLoading(0);
            }
            
            this.stopLoading(0);
            
        }
        this.stopLoading(0);
    }

    stopLoading(stop:any){
        this.shareService.hideLoader();
    }

    //show all episodes
    showAll(){
        var i = 0;
        console.log(this.episodeList.length);
        for(i = 0; i < this.episodeList.length; i++){
            
            
           this.semanticui.openAccordion(i);
        }
    }

    //close all episodes
    closeAll(){
        var i = 0;
         for(i = 0; i < this.episodeList.length; i++){
            
            this.semanticui.closeAccordion(i);
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

    continueAndStuff(){
        alert('test');
    }

    //select the best episode 
    selectBestEpisode(i:number){
        console.log("selecting best episode for: " + (this.episodeList.length - i - 1));

      
        for(let episode of this.episodeList[(this.episodeList.length - i - 1)]){
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
                    } else if(episode.botId.indexOf(botname) > -1 && episode.name.indexOf("480") == -1 &&  episode.name.indexOf("720") == -1 && episode.name.indexOf("1080") == -1 ){ //select first item thats there (probably only used if there isn't a filename available that specifies a resolution)
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
            this.selectedItems.unshift(pack);
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
            this.appendToDownloadsDirectly(download);
        }


    }

    appendToDownloadsDirectly(download: any){

        console.log(download);
        var genid = this.utilityService.generateId(download.botId, download.number);
        var newDownload = {id : genid, pack : download.number, bot: download.botId, filename: download.name, status : "Waiting", progress : "0", speed : "0"};
        this.downloadService.addDownload(newDownload);

    }
}
