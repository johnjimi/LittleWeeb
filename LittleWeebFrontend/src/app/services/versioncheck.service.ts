import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {ShareService} from './share.service';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class VersionService {

    private currentVersion : string;

    constructor(private http: Http, private shareService:ShareService){
        this.currentVersion = "0.1.2"; //current version
    }

    //checks the version on the github with it's predined version, shows modal with message that there is a new version if versions differs.
    async getVersion(){
        //actually using atarashii's MAL api, as it doesn't require authentication! see more here: https://atarashii.toshocat.com/docs/2.0/anime/
        //using local proxy to allow CORS request to api without the use of the backend, THIS MAY CHANGE IN THE FUTURE, for now, this works I guess.
        const response = await this.http.get('https://raw.githubusercontent.com/EldinZenderink/LittleWeeb/master/VERSION').toPromise();
        var version = JSON.stringify(response).indexOf(this.currentVersion);
        var newversion = JSON.stringify(response).split('"')[3].split('\\')[0];
        if(version == -1){
            this.shareService.showModal("There is a new version available!", "Your current version is v" + this.currentVersion + 
                                        ", but version " + newversion + " has been released as of now!", 
                                        "feed", 
                                        `<div class="ui red basic cancel inverted button">
                                        <i class="remove icon"></i>
                                        Not interested.
                                        </div>
                                        <a href="https://github.com/EldinZenderink/LittleWeeb/releases" class="ui green ok inverted button">
                                        <i class="checkmark icon"></i>
                                        Go to Github.
                                        </a>`);
            console.log("new version");
        }
        console.log(response);

    }
}