import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {MalService} from '../../services/mal.service'
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
                <p style="text-align: center; display: table; margin: 0 auto;">
                    <button class="ui blue inverted button" (click)="showAll()"> Show all days</button>
                    <button class="ui blue inverted button" (click)="showToday()"> Show today</button>
                </p>
            </div>
            <div class="ui divider"> </div>
            <div class="row">
                <div class="ui styled accordion" id="currentlyairing" style=" width: 100%; ">
                    <div  *ngFor="let day of airingAnime; let i=index"  >
                        <div class="title" id="{{day}}">
                            <i class="dropdown icon"></i>                          
                            <label>{{day.day}}</label>
                        </div>
                        <div class="content">
                            <div class="ui items" id="currentlyAiringAnimes"  >      
                                <div (click)="showPackListFor(anime)"  *ngFor="let anime of day.anime" class="item">
                                    <div class="ui tiny image"> 
                                        <img src="{{anime.image_url}}" /> 
                                    </div>
                                    <div class="middle aligned content">
                                        <a class="header">{{anime.title}}</a>
                                    </div>
                                </div>                             
                            </div>
                        </div>
                    </div>  
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
    private today : string;
    private modalToShow : number;
    //gets the currently airing anime from the Nibl API
    constructor(private semanticui:SemanticService, private malService: MalService, private shareService: ShareService, private utilityService: UtilityService, private backendService : BackEndService, private router: Router){
        this.currentlyAiringLoading = false;
        this.animeTitle = "Anime";
        this.showCurAir = true;
        this.showAnime = false;
    }
    async ngOnInit(){
        this.shareService.showLoaderMessage("Loading currently airing!");

        var data;
        if(this.shareService.getStoredCurrentlyAiring() == null){
            data = await this.malService.getCurrentlyAiring();
            this.shareService.storeCurrentlyAiring(data);
        } else {
            data = this.shareService.getStoredCurrentlyAiring();
        }
        var dayArray = new Array();
        var modalToShow = 0;
        var count = 0;
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var now = new Date();
        this.today = days[now.getDay()];
        console.log(this.today);
        for(let day in data){
            var dayc = day.charAt(0).toUpperCase() + day.slice(1);
           dayArray.push({ "day" : dayc, "anime" : data[day]});
            if(this.today == dayc){
                this.modalToShow = count;
                console.log(modalToShow);
            }
            count++;
        }
        console.log(dayArray);
        this.airingAnime = dayArray;
        
        this.semanticui.enableAccordion();       
        this.semanticui.openAccordion(this.modalToShow);
        this.shareService.hideLoader();
    }

    showAll(){
         var counter = 0;
        for(let day in this.airingAnime){
            this.semanticui.openAccordion(counter);
            counter++;
        }
    }

    showToday(){
        var counter = 0;
        for(let day in this.airingAnime){
            if(counter != this.modalToShow){
                this.semanticui.closeAccordion(counter);
            }
            counter++;
        }
        this.semanticui.openAccordion(this.modalToShow);
    }
    //to redirect to packlist
    showPackListFor(anime : any){
        console.log(anime);
        this.shareService.showLoader();
        this.shareService.setAnimeTitle(anime);
        this.router.navigate(['packlist']);      
    }
}
