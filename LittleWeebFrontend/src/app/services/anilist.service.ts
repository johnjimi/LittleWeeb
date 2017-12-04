import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class AniListService {

    accessToken : string;
    timeAccessExpires : number;
    timeAccessGranted : number;

    constructor(private http: Http){
        this.timeAccessExpires = 0;
        this.timeAccessGranted = 0;
        this.accessToken = "NONE";
        console.log("TRYING TO REQUEST ANILIST TOKEN");
        this.requestToken();
       
    }
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

     //the only thing this service does (for now) is searching 
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