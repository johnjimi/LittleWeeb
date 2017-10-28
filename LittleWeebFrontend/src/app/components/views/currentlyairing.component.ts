import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {BackEndService} from '../../services/backend.service'
import {SemanticService} from '../../services/semanticui.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Component({
    selector: 'currentlyairing',
    template: `
        <div *ngIf="showCurAir">
            <div class="ui horizontal divider"> Currently Airing </div>
            <div class="row">
                <div class="ui items" id="currentlyAiringAnimes" *ngFor="let anime of airingAnime">
                    <div (click)="showPackListFor(anime)" class="item" *ngIf="anime.airing_status == 'currently airing'">
                        <div class="ui tiny image"> 
                            <img src="{{anime.image_url_med}}" /> 
                        </div>
                        <div class="middle aligned content">
                            <a class="header">{{anime.title_english}}</a>
                        </div>
                    </div> 
                    <div class="ui divider" *ngIf="anime.airing_status == 'currently airing'"> </div>
                </div>
            </div>
        </div>
    `
})
export class CurrentlyAiring {
    airingAnime : Object;
    currentlyAiringLoading : boolean;
    waitForDataInterval : any;
    animeTitle : string;
    showCurAir : boolean;
    showAnime : boolean;

    //gets the currently airing anime from the Nibl API
    constructor(private semanticui:SemanticService, private niblService: NiblService, private shareService: ShareService, private utilityService: UtilityService, private backendService : BackEndService, private router: Router){
        this.currentlyAiringLoading = false;
        this.animeTitle = "Anime";
        this.showCurAir = true;
        this.showAnime = false;
        this.niblService.getCurrentlyAiringAnime().subscribe(json => {
            console.log(json);
            this.airingAnime = json.content; 
            this.currentlyAiringLoading = true;
        });
    }

    //to redirect to packlist
    showPackListFor(anime : any){
        console.log(anime);
        this.shareService.setAnimeTitle(anime);
        this.router.navigate(['packlist']);      
    }
}
