import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Http} from '@angular/http';
import {Subject} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import {ShareService} from '../../services/share.service'
import {NiblService} from '../../services/nibl.service'
import {UtilityService} from '../../services/utility.service'
import {SemanticService} from '../../services/semanticui.service'
import {BackEndService} from '../../services/backend.service'
import {AniListService} from '../../services/anilist.service'
import {KitsuService} from '../../services/kitsu.service'
import {DownloadService} from '../../services/download.service'

@Component({
    selector: 'packlist',
    templateUrl: './html/packlist.component.html',
    styleUrls: ['./css/packlist.component.css']
})
export class PackList {

    //episode stuff
    botList : any[];
    botname : string;
    resolution : string = this.shareService.defaultResolution;
    showAllBots : boolean;
    showAllResolutions : boolean;
    selectedItems : any[];
    packsSelected :boolean;
    title : string;
    episodeList: any[];
    movieList: any[];
    prefferedbots : string[];
    showList : boolean;
    showError : boolean;

    //filedir
    animeDir : string;

    //information view
    animeInfo : any;
    showEpisodes : boolean = true;
    showInfo : boolean = false;
    showTrailer: boolean= false;

    //anime-relations  https://github.com/erengy/anime-relations
    animeRelations : string = "";

    //debugging
    enableDebug : boolean = false;

    //this component shows a list with packs, it handles batch selecting, best episode/movie selecting, bot and resolution filtering as well as finding anime episodes that are named a bit differently

    constructor(private http:Http, private router: Router, private downloadService : DownloadService, private kitsuService: KitsuService, private shareService: ShareService, private niblService:NiblService, private utilityService: UtilityService, private semanticui : SemanticService, private backEndService: BackEndService){
        console.log("initianted packlist");
        
        let getLocalStoredAnime = this.shareService.getDataLocal("animeview");

        if(getLocalStoredAnime != false){   this.botname = "all";
            let animeView = JSON.parse(getLocalStoredAnime);
            this.showAllBots = animeView.showAllBots;
            this.showAllResolutions = animeView.showAllResolutions;
            this.packsSelected = animeView.packsSelected;
            this.selectedItems = animeView.selectedItems;
            this.title = animeView.title;
            this.episodeList= animeView.episodeList;
            this.movieList = animeView.movieList;
            this.showList = animeView.showList;
            this.showError =  animeView.showError;
            this.botList = animeView.botList;
            this.prefferedbots = animeView.prefferedbots;
            this.animeDir = animeView.animeDir;
            this.animeInfo = animeView.animeInfo;
            this.showEpisodes =animeView.showEpisodes;
            this.showInfo = animeView.showInfo;
            this.showTrailer = animeView.showTrailer;
            this.enableDebug = true;
            this.shareService.updatetitle.next(this.animeInfo.animeInfo.canonicalTitle);

        } else {
            
            this.botname = "all";
            this.showAllBots = true;
            this.showAllResolutions = true;
            this.packsSelected = false;
            this.selectedItems = [];
            this.title = "";
            this.showList = false;
            this.showError = false;
            this.botList = new Array();
            this.prefferedbots  = ["CR-HOLLAND|NEW", "CR-AMSTERDAM|NEW", "CR-FRANCE|NEW", "Ginpachi-Sensei", "Cerebrate"];
            this.animeInfo = {};
            this.showEpisodes = false;
            this.showInfo = false;
            this.showTrailer = false;
            this.animeDir = "";
            this.enableDebug = true;

            this.episodeList= new Array();
            this.movieList = new Array();
        }
        
        
        this.semanticui.enableAccordion();
        this.semanticui.enableDropDown();
       
    }

    async ngOnInit(){
        await this.http.get('https://raw.githubusercontent.com/erengy/anime-relations/master/anime-relations.txt').toPromise().then(testReadme => this.animeRelations= testReadme.text());
      
        this.shareService.animetitlesub.take(1).subscribe(async(anime) => {
            console.log("got mah anime");
            console.log(anime);
            if(anime !== null){
                
                this.shareService.showLoaderMessage("Loading anime: " + anime.attributes.canonicalTitle );   
                if(this.animeInfo === undefined){
                    this.animeInfo = this.kitsuService.getAllInfo(anime.id);
                    this.animeDir = this.animeInfo.animeInfo.canonicalTitle.split(' ').join('_') + "_" + this.animeInfo.id;                            
                    this.showPackListFor(this.animeInfo);
                } else {
                    if(this.animeInfo.id != anime.id){
                        this.animeInfo = await this.kitsuService.getAllInfo(anime.id);
                        console.log(this.animeInfo);
                        this.animeDir = this.animeInfo.animeInfo.canonicalTitle.split(' ').join('_') + "_" + this.animeInfo.id;                            
                        this.showPackListFor(this.animeInfo);
                    } else {
                        this.shareService.hideLoader();
                    }  
                }
               
            } else {
                if(this.animeInfo === undefined){
                    this.title = "No episodes found!";
                    this.showError = true;
                    this.shareService.hideLoader();
                }
            }
        }); 
    }

    ngOnDestroy(){

        var simpleObject = {
            botname : this.botname,
            showAllBots : this.showAllBots,
            showAllResolutions : this.showAllResolutions,
            packsSelected : this.packsSelected,
            selectedItems : this.selectedItems,
            title : this.title,
            episodeList: this.episodeList,
            movieList : this.movieList,
            showList : this.showList,
            showError : this.showError,
            botList : this.botList,
            prefferedbots : this.prefferedbots,
            animeInfo : this.animeInfo,
            showEpisodes : this.showEpisodes,
            showInfo : this.showInfo,
            showTrailer : this.showTrailer,
            enableDebug : this.enableDebug,
            animeDir : this.animeDir
        }
        console.log(simpleObject);
        this.shareService.storeDataLocal("animeview", JSON.stringify(simpleObject));
    }
   
    //shows all the available episodes for x anime, has logic to request files with synonyms as well, has logic  to parse episode title so only the essence(the title) is used for checking
    
    async showPackListFor(anime : any){
        
        //disable views for error AND list (cus no episodes have been added yet)

        //some global stuff     
        let seasonIdentifiers = new Array();

        for(let i = 0; i < 99; i++){
            if(i > 0){
                
                let numberAsWord = this.utilityService.numberToWords(i);
                let numberAsRoman = this.utilityService.numberToRoman(i);
                let numberOrdinal = this.utilityService.numberToOrdinal(i);
                let numberAsWordWithOrdinal = this.utilityService.numberToWordsWithOrdinal(i);

                let seasonIdentifierObj = {
                    seasonDelimiter : [" season " + numberAsWordWithOrdinal, " " + numberAsWordWithOrdinal + " season", " season " + numberAsWord, " " + numberAsWord + " season", " " + i.toString() + numberOrdinal + " season", " season " + i.toString(), " " + i.toString() + numberOrdinal, " s" + i.toString(), " " + numberAsRoman + " ", " s0" + i + "e"],
                    seasonNumber : i
                }

                seasonIdentifiers.push(seasonIdentifierObj);
            }else {
                let seasonIdentifierObj = {
                    seasonDelimiter : ["season", "s", "st", "nd", "rd", "th"],
                    seasonNumber : 0
                }

                seasonIdentifiers.push(seasonIdentifierObj);
            }
        }

        this.consoleWrite("SEASON IDENTIFIERS:");
        this.consoleWrite(seasonIdentifiers);


        
        //get anime relation and parse episode where to start and where to stop:
        let everyRelation = this.animeRelations.split('#');
        let startStopEpisodes = new Array();
        for(let relation of everyRelation){

            let id = '|' + anime.id + '|';

            if(relation.indexOf(id) > -1){
                
                let partWithEpisodeIndex = relation.split("- ")[1];

                let leftOrRight = "undefined";

                if(partWithEpisodeIndex.split(id)[1].indexOf("->") > -1){
                    leftOrRight = "left";
                } else {
                    leftOrRight = "right";
                }

                let hasWrongSeasonNumbers = false;
                
                let startEpisodeString = partWithEpisodeIndex.split(':')[1].split('-')[0];
                let endEpisodeString = partWithEpisodeIndex.split(':')[1].split('-')[1].split(" -> ")[0];

                
                let shouldStartEpisodeString = partWithEpisodeIndex.split(':')[2].split('-')[0];
                let shouldEndEpisodeString = partWithEpisodeIndex.split(':')[2].split('-')[1];

                if(shouldEndEpisodeString.indexOf('!') > -1){
                    hasWrongSeasonNumbers = true;
                    shouldEndEpisodeString = shouldEndEpisodeString.split('!')[0];
                }

                

                let newStartStop = {
                    startEpisode : Number(startEpisodeString),
                    endEpisode : Number(endEpisodeString),
                    shouldStartEpisode : Number(shouldStartEpisodeString),
                    shouldEndEpisode : Number(shouldEndEpisodeString),
                    hasWrongSeasonNumbers : hasWrongSeasonNumbers,
                    leftOrRight : leftOrRight
                }

                startStopEpisodes.push(newStartStop);
                break;
            }
        }

        this.consoleWrite("Start Stop Episode Numbering: ");
        this.consoleWrite(startStopEpisodes);


        this.shareService.showLoaderMessage("Retreiving Synonyms"); 

        //getting all the synonyms
        let synonyms = new Array();        
        for(let key in anime.animeInfo.titles){
            this.consoleWrite(key); 
            let synonym = anime.animeInfo.titles[key];
            synonyms.push(synonym);            
        }
        this.consoleWrite("synonyms: ");
        this.consoleWrite(synonyms); 

        //getting season
        let seasonNumber = 0;
        let seasonDelimiter = "";
        for(let seasonIdentifier of seasonIdentifiers){
            if(seasonIdentifier.seasonNumber > 0){               
                let found = false;
                for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                   if(anime.animeInfo.canonicalTitle.toLowerCase().indexOf(seasonIdentifierString) != -1){
                        found = true;
                        seasonNumber = seasonIdentifier.seasonNumber;
                        seasonDelimiter = seasonIdentifierString;
                        break;
                    }       
                }
                if(found){
                    break;
                }
            }            
        }

        this.consoleWrite("Found season number:");
        this.consoleWrite(seasonNumber);
         this.consoleWrite(seasonDelimiter);

        
        this.shareService.showLoaderMessage("Retreiving episodes"); 

        //get all episodes using synonyms 
        let allEpisodes = new Array();

        for(let synonym of synonyms){
            let searchQuery = this.utilityService.stripName(synonym);   
            let wordsInFileName = searchQuery.split(' ');
            searchQuery = "";
            for(let word of wordsInFileName){
                let withoutNumbers = word.replace(/[0-9]/g, "").trim();
                if(seasonIdentifiers[0].seasonDelimiter.indexOf(withoutNumbers) == -1){
                    searchQuery += word + " ";
                }
            }               

         
            let filesFound = await this.niblService.getSearchAnimeResultsSync(searchQuery);      
            
            if(searchQuery.length > 3){
                for(let file of filesFound){
                    if(allEpisodes.indexOf(file) == -1){                    
                        if(this.utilityService.compareNames(searchQuery, this.utilityService.stripName(file.name)) > 20){                            
                            allEpisodes.push(file);
                        }
                    }
                }
            }

            searchQuery = synonym;
            if(searchQuery.length > 3){
                let filesFound = await this.niblService.getSearchAnimeResultsSync(searchQuery);      
                for(let file of filesFound){
                    if(allEpisodes.indexOf(file) == -1){   
                        
                        if(this.utilityService.compareNames(searchQuery, this.utilityService.stripName(file.name)) > 20){                            
                            allEpisodes.push(file);
                        }
                    }
                }
            }   
            
            if(seasonNumber > 0){
                searchQuery = synonym.toLowerCase().split(seasonDelimiter)[0];

                let seasonIdentifierBe = seasonIdentifiers[seasonNumber];
                for(let identifier of seasonIdentifierBe.seasonDelimiter){
                    if(searchQuery.indexOf(identifier)){
                        searchQuery = searchQuery.split(identifier)[0];
                    }
                }
                
                this.consoleWrite("Search query splited by season delimiter:");
                this.consoleWrite(searchQuery);
                filesFound = await this.niblService.getSearchAnimeResultsSync(searchQuery);      
                for(let file of filesFound){
                    if(allEpisodes.indexOf(file) == -1){   
                        
                        if(this.utilityService.compareNames(searchQuery, this.utilityService.stripName(file.name)) > 25){                            
                            allEpisodes.push(file);
                        }
                    }
                }
            }
            
        }

        this.consoleWrite("Following episodes were found:");
        this.consoleWrite(allEpisodes);


        
        this.shareService.showLoaderMessage("Parsing Episodes"); 
        // get bot list and bind bot index to name
        let bots = await this.niblService.getBotListSync();

        //makes it easier on the loop for getting the bot (Doesn't have to roll through the botlist over and over for each file)
        let botsWithId = {};

        //appends botname to index botid
        for(let bot of bots){
            botsWithId[bot.id] = bot.name;
        }

        //parse anime episodes while determining if episode found belongs to the anime viewed 
       

        let parsedEpisodeFiles = new Array();
        for(let episodeFile of allEpisodes){
            if(startStopEpisodes.length > 0){
                let epNum = episodeFile.episodeNumber;
                let start = 0;
                let stop = 0;

                if(startStopEpisodes[0].leftOrRight == "left"){
                    start = 0;
                    stop = startStopEpisodes[0].endEpisode;
                    if(seasonNumber > 0){
                        if(epNum >= start && epNum <= stop){  
                            episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                            parsedEpisodeFiles.push(episodeFile);
                        } 
                    } else {
                        if(epNum <= startStopEpisodes[0].startEpisode){
                            
                            
                            episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId);   
                            parsedEpisodeFiles.push(episodeFile);
                        } 
                    }
                   
                } else {
                    start = startStopEpisodes[0].startEpisode;
                    stop = startStopEpisodes[0].endEpisode;
                    let amountofepisodes = stop - start;
                    let seasonIdentifier = seasonIdentifiers[seasonNumber];
                    if(epNum >= start && epNum <= stop){

                        let foundseasonident = false;
                        if(seasonNumber > 0){
                            for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                                if(this.utilityService.stripName(episodeFile.name).indexOf(seasonIdentifierString) != -1){                              
                                    foundseasonident = true;
                                    break;
                                }
                            }
                        } 
                        if(!foundseasonident){
                             episodeFile.episodeNumber = episodeFile.episodeNumber - start + 1;
                        }             
                        
                        episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId);               
                        parsedEpisodeFiles.push(episodeFile);
                    } else {
                        
                        if(seasonNumber > 0){
                            for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                                if(this.utilityService.stripName(episodeFile.name).indexOf(seasonIdentifierString) != -1){                                     
                                    
                                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId);                            
                                    parsedEpisodeFiles.push(episodeFile);
                                    break;
                                }
                            }
                        } 
                    }
                }                
            } else {                
                let seasonIdentifier = seasonIdentifiers[seasonNumber];
                if(seasonNumber > 0){
                    for(let seasonIdentifierString of seasonIdentifier.seasonDelimiter){
                        if(this.utilityService.stripName(episodeFile.name).indexOf(seasonIdentifierString) != -1){  
                            
                            
                            episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId);                             
                            parsedEpisodeFiles.push(episodeFile);
                            break;
                        }
                    }
                } else {

                  
                    
                    episodeFile.botId =  this.addBotToBotList(episodeFile.botId, botsWithId); 
                    parsedEpisodeFiles.push(episodeFile);
                }
            }
        }
        this.consoleWrite("Following episodes were parsed:");   
        this.consoleWrite(parsedEpisodeFiles);
        this.consoleWrite("Following bots were parsed:");
        this.consoleWrite(this.botList);
        //index by episode


        this.shareService.showLoaderMessage("Retreiving episode information"); 

        this.episodeList = new Array();
        let tempEpListBe =  new Array();
        for(let parsedFile of parsedEpisodeFiles){
            let epNum = parsedFile.episodeNumber;
            if(this.animeInfo.animeInfo.subtype == "TV"){
                if(this.episodeList[epNum] === undefined){
                    this.episodeList[epNum] = new Array();
                    this.episodeList[epNum].push({episodeNumber: epNum, episodeTitle: "Episode " + epNum, files: []}); 
                    
                    tempEpListBe[epNum] = new Array();
                    tempEpListBe[epNum].push(parsedFile);
                } else {
                    tempEpListBe[epNum].push(parsedFile);
                    var obj = this.episodeList[epNum][0];
                    obj.files=tempEpListBe[epNum];
                    this.episodeList[epNum][0] = obj;
                }
            } else {
                if(this.movieList[epNum] === undefined){
                    this.movieList[epNum] = new Array();
                    this.movieList[epNum].push(parsedFile);
                } else {
                    this.movieList[epNum].push(parsedFile);
                }
            }
           
        }

        if(this.episodeList[0] === undefined){
             this.episodeList[0] = "not defined";
        }
        if(this.movieList[0] === undefined){
             this.movieList[0] = "not defined";
        }
       
        this.consoleWrite("Following episodes were indexed:");
        this.consoleWrite(this.episodeList);
        
        this.showEpisodes = true;
        this.showList = true;
        this.shareService.hideLoader();
        this.semanticui.enableAccordion();
        this.semanticui.enableDropDown();

    }

    addBotToBotList(id : number, botsWithId : any){
        let botname = botsWithId[id];                                                                        
                
        if(botname === undefined){
            botname = "Unknown - these files cannot be downloaded!";
        }
        if(this.botList.indexOf(botname) == -1){                                                                        
            this.botList.push(botname);                                                                                 
        }
        return botname; 
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
        this.semanticui.closeAccordion(i);
        let files = this.episodeList[i][0].files;
        console.log(files);
        for(let file of files){
            console.log(file);
            if(this.prefferedbots.indexOf[file.botId] && file.name.indexOf(this.resolution)){
                this.checkIfPackIsInSelected(file);

                if(this.selectedItems.length > 0){
                    this.packsSelected = true;
                } else {
                    this.packsSelected = false;
                }
                break;
            } else if(file.name.indexOf(this.resolution)){
                this.checkIfPackIsInSelected(file);

                if(this.selectedItems.length > 0){
                    this.packsSelected = true;
                } else {
                    this.packsSelected = false;
                }
                break;
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
        
        this.shareService.showMessage("succes", "Added to Downloads!");

    }

    appendToDownloadsDirectly(download: any){

        console.log(download);
        var genid = this.utilityService.generateId(download.botId, download.number);


        var newDownload = {id : genid, pack : download.number, bot: download.botId, filename: download.name, status : "Waiting", progress : "0", speed : "0", dir : this.animeDir};
        this.downloadService.addDownload(newDownload);
        
        this.shareService.showMessage("succes", "Added to Downloads!");

    }

    addToFavorites(){
        var animeobj = {id: this.animeInfo.id, attributes : this.animeInfo.animeInfo};
        console.log(animeobj);
        this.shareService.addFavoriteAnime(animeobj);
        this.shareService.showMessage("succes", "Added to Favorites!");
    }

    async consoleWrite(log: any){
        if(this.enableDebug){
            console.log(log);
        }
    }

    checkIfStringContiains(input :string, contains: string){
        if(input.indexOf(contains) != -1){
            return true;
        } else {
            return false;
        }
    }
}
