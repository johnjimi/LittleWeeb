import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

/**
 * (INACTIVE-SERVICE) AniList service 
 * Service for communicating with AniList api (not in use anymore due to switch to Kitsu) 
 * 
 * @export
 * @class AniListService
 */
@Injectable()
export class AniListService {

    accessToken : string;
    timeAccessExpires : number;
    timeAccessGranted : number;

    /**
     * Creates an instance of AniListService.
     * @param {Http} http (used for http requests)
     * @memberof AniListService
     */
    constructor(private http: Http){
        this.timeAccessExpires = 0;
        this.timeAccessGranted = 0;
        this.accessToken = "NONE";
        console.log("TRYING TO REQUEST ANILIST TOKEN");
        this.requestToken();
       
    }

    
    /**
     * Get token from anilist to use with api calls to anilist using bearer token / OAuth 2.
     * 
     * @memberof AniListService
     */
    async requestToken(){
        var body = 'grant_type=client_credentials&client_id=mrrare-jrao5&client_secret=vxUxjTDETlaJFDXSbyFMuJNAJGRpZ0';
        var headers = new Headers();
        headers.append('Accept-Language', 'en-US,en;q=0.5');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        var response = await this.http.post( encodeURI('https://anilist.co/api/auth/access_token'), body, {
            headers: headers
        }).toPromise().then(res => {
            this.accessToken = res.json().access_token;
            var expires = res.json().expires_in;
            this.timeAccessGranted =  new Date().getTime() / 1000;
            this.timeAccessExpires = this.timeAccessGranted + expires;

        });
    }

    /**
     * Searches for a anime
     * 
     * @param {string} search (search query)
     * @returns (boolean=false if request failed, or json document with search results)
     * @memberof AniListService
     */
    async searchAnime(search : string){
        
        if(this.accessToken != "NONE"){
            var currenttime =  new Date().getTime() / 1000;
            if(this.timeAccessExpires > currenttime){
                
                const response = await this.http.get( encodeURI('https://anilist.co/api/anime/search/' + search.trim().toLowerCase() + '?access_token=' + this.accessToken)).toPromise();
             
                return response.json();

            } else {
                this.requestToken();
                return false;
            }
        } else {
            return false;
        }
        
    }

    /**
     * Gets anime information using anime id.
     * 
     * @param {*} id (Anime ID)
     * @returns (boolean=false if request failed, or json document with anime information)
     * @memberof AniListService
     */
    async getAnimeInfo(id : any){
        if(this.accessToken != "NONE"){
            var currenttime =  new Date().getTime() / 1000;
            if(this.timeAccessExpires > currenttime){
                const response = await this.http.get( encodeURI('https://anilist.co/api/anime/' + id + '?access_token=' + this.accessToken)).toPromise();
                var unparsed = JSON.stringify(response);
                var json = JSON.parse(unparsed.split('{"_body":"')[1].split('","status"')[0].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"));
             
                return response.json();
            } else {
                this.requestToken();
                return false;
            }
        } else {
            return false;
        }
        
    }

    /**
     * Get currently airing
     * 
     * @returns (boolean=false if request failed, or json document with currently airing anime)
     * @memberof AniListService
     */
    async getCurrentlyAiring(){
        if(this.accessToken != "NONE"){
            var currenttime =  new Date().getTime() / 1000;
            if(this.timeAccessExpires > currenttime){
                const response = await this.http.get( encodeURI('https://anilist.co/api/browse/anime?status=Currently Airing&full_page=true&airing_data=true&genres_exclude=Hentai&access_token=' + this.accessToken)).toPromise();
                var unparsed = JSON.stringify(response);
                var json = JSON.parse(unparsed.split('{"_body":"')[1].split('","status"')[0].replace(/\\"/g, "\"").replace(/\\\\/g, "\\"));
          
                return json;
            } else {
                this.requestToken();
                return false;
            }
        } else {
            return false;
        }
    }
  
}