import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';
import {ShareService} from './share.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class NiblService {

    month : number;
    year : number; 
    date : Date;
    season: string;
    currentlyAiring : Object;
    searchResult : Object;
    botList : Object;
    latestPacks : Object;
    packsForBot : Object;
    observable : any;
    //service to get and request information from the nibl.co.uk api!
    constructor(private http: Http,private shareService: ShareService){
        console.log("Nibl Service Initialiazed...");
        this.date = new Date();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
    }

    //functions WITHOUT sync in the name are old and should be replaced, but a bunch of components still uses them

    //gets all currently airing anime, parsed by nibl.co.uk api itself (on request :D)
    getCurrentlyAiringAnime(){
        var seasons = [ "Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];
        var currentSeason = seasons[this.month + 1];
        this.observable = this.http.get('https://api.nibl.co.uk:8080/anilist/series/season?year=' + this.year + '&season=' + currentSeason).map(res => {
            this.observable = null;
            this.currentlyAiring = res.json();
            return this.currentlyAiring;

        }).share();
        return this.observable;
    }

    //searches anime in the nibl.co.uk database (only files, no other information, mal.service handles the information for x anime)
    getSearchAnimeResults(query : String){
        this.observable = this.http.get( 'https://api.nibl.co.uk:8080/nibl/search/?query=' + query + '&episodeNumber=-1').map(res => {
            this.observable = null;
            this.searchResult = res.json().content;
            return this.searchResult;
        }).share();
        return this.observable;
    }

    //get available bots
    getBotList(){
        return this.http.get( 'https://api.nibl.co.uk:8080/nibl/bots').map(res => {
            this.observable = null;
            this.botList = res.json().content;
            return this.botList;
        });
    }

    //get name of bot
    getBotName(id : number){
        this.observable = this.http.get('https://api.nibl.co.uk:8080/nibl/bots/' + id).map(res => {
            this.observable = null;
            return res.json().content.name;
        }).share();
        return this.observable;
    }

    //gets all currently airing anime, parsed by nibl.co.uk api itself (on request :D)
    async getCurrentlyAiringAnimeSync(){
        var seasons = [ "Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];
        var currentSeason = seasons[this.month + 1];
        const response = await this.http.get('https://api.nibl.co.uk:8080/anilist/series/season?year=' + this.year + '&season=' + currentSeason).toPromise();

        return response.json();

    }
    //searches anime in the nibl.co.uk database (only files, no other information, mal.service handles the information for x anime)
    async getSearchAnimeResultsSync(query : String){
        const response = await this.http.get( 'https://api.nibl.co.uk:8080/nibl/search/?query=' + query + '&episodeNumber=-1').toPromise();
        return response.json().content;
    }
    
    //get available bots
    async getBotListSync(){
        const response = await this.http.get( 'https://api.nibl.co.uk:8080/nibl/bots').toPromise();
        return response.json().content;
    }
    
    //get name of bot
    async getBotNameSync(id : number){
        const response = await this.http.get('https://api.nibl.co.uk:8080/nibl/bots/' + id).toPromise();
        return response.json().content.name;
    }



}