import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class MalService {

    constructor(private http: Http){

    }

    //the only thing this service does (for now) is searching 
    async searchAnime(search : string){
        //actually using atarashii's MAL api, as it doesn't require authentication! see more here: https://atarashii.toshocat.com/docs/2.0/anime/
        //using local proxy to allow CORS request to api without the use of the backend, THIS MAY CHANGE IN THE FUTURE, for now, this works I guess.
        const response = await this.http.get( encodeURI('http://localhost:6010?cors=https://download.toshocat.com/2.1/anime/search?q=' + search.trim().toLowerCase())).toPromise();
        console.log(response);
        return response.json();
    }
}