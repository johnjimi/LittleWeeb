import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {AniListService} from '../../services/anilist.service'
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
    <div class="ui grid" style="margin-left: 1%;">
        <div *ngIf="showCurAir" class="computer only row">
            <div class="ui horizontal divider"> Currently Airing </div>
            <p style="text-align: center; display: table; margin: 0 auto;">
                <button class="ui blue inverted button" (click)="showAll()"> Show all days</button>
                <button class="ui blue inverted button" (click)="showToday()"> Show today</button>
            </p>
            <div class="ui divider"> </div>
            <div class="ui styled accordion" id="currentlyairing" style=" width: 100%; margin-top: 10px;">
                <div  *ngFor="let day of airingAnime; let ind=index"  >
                    <div class="title" id="{{ind}}">
                        <i class="dropdown icon"></i>                          
                        <label>{{daysArray[ind]}}</label>
                    </div>
                    <div class="content">
                        <div class="ui items" id="currentlyAiringAnimes"  >      
                            <div (click)="showPackListFor(anime)"  *ngFor="let anime of day" class="item">
                                <div class="ui tiny image"> 
                                    <img src="{{anime.image_url_med}}" /> 
                                </div>
                                <div class="middle aligned content">
                                    <a class="header">{{anime.title_english}}</a>
                                </div>
                            </div>                             
                        </div>
                    </div>
                </div>  
            </div>       
        </div>
    </div>
    <div class="ui grid">
        <div *ngIf="showCurAir" class="seven wide row mobile tablet only " style="margin-left:30%;">
            <div class="ui horizontal divider"> Currently Airing </div>
                <button class="ui blue inverted button" style="width: 45%; margin-left: 5%; margin-bottom: 10px;" (click)="showAll()"> Show all days</button>
                <button class="ui blue inverted button" style="width: 45%; margin-bottom: 10px;" (click)="showToday()"> Show today</button>    
            <div class="ui divider" > </div>
            <div class="ui styled accordion"  id="currentlyairing" style=" width: 100%; ">
                <div  *ngFor="let day of airingAnime; let ind=index"  >
                    <div class="title" id="{{ind}}">
                        <i class="dropdown icon"></i>                          
                        <label>{{daysArray[ind]}}</label>
                    </div>
                    <div class="content">
                        <div class="ui items"  id="currentlyAiringAnimes"  >      
                            <div (click)="showPackListFor(anime)" *ngFor="let anime of day" class="item">
                                <div class="ui grid">
                                    <div class="column four wide">
                                        <div class="ui tiny image"> 
                                            <img src="{{anime.image_url_med}}" style="max-width: 100%;"    /> 
                                        </div>
                                    </div>
                                    <div class="column ten wide middle aligned"> 
                                        
                                        <h3  style="text-align: center;">{{anime.title_english}}</h3>
                                    </div>
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
    daysArray : any;
    private today : string;
    private modalToShow : number;
    //gets the currently airing anime from the Nibl API
    constructor(private semanticui:SemanticService, private aniListService: AniListService, private shareService: ShareService, private utilityService: UtilityService, private backendService : BackEndService, private router: Router){
        this.currentlyAiringLoading = false;
        this.animeTitle = "Anime";
        this.showCurAir = true;
        this.showAnime = false;
        this.daysArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    }
    async ngOnInit(){
        this.shareService.showLoaderMessage("Loading currently airing!");


        var tempInterval = setInterval( async()=>{
            var data;
            if(this.shareService.getStoredCurrentlyAiring() == null){
                    
                data = await this.aniListService.getCurrentlyAiring();
                console.log(data);
                this.shareService.storeCurrentlyAiring(data);

                
                this.shareService.storeCurrentlyAiring(data);
            } else {
                data = this.shareService.getStoredCurrentlyAiring();
            }
            if(data != false){
                var dayArray = new Array(7);
                console.log(this.today);
                for(let anime of data){
                    console.log(anime);
                    try{
                        var convertToDate = Date.parse(anime.airing.time);
                        var d = new Date(convertToDate);
                        var n = d.getDay()
                        if(dayArray[n] === undefined){
                            dayArray[n] = new Array();
                            dayArray[n].push(anime);
                        } else {
                            dayArray[n].push(anime);
                        }
                        
                    } catch (e){
                        console.log("Anime is not airing : " + anime.title_english);
                    }
                   
                }
                console.log(dayArray);
                this.airingAnime = dayArray;
                
                this.semanticui.enableAccordion();       
                this.semanticui.openAccordion(this.modalToShow);
                this.shareService.hideLoader();
                
                var d = new Date();
                var today = d.getDay();
                console.log(today);
                this.semanticui.openAccordion(today);
                clearInterval(tempInterval);
               
            }
           
            
        }, 1000);
        
           
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
