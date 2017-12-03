import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {AniListService} from '../../services/anilist.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Component({
    selector: 'search',
    template: `
     <div class="ui grid">
        <div class="row computer only" style="width: 100%;">
            <div class="ui horizontal divider">SEARCH</div>
            <div class="ui icon input"  style="width: 100%;">
                <input #searchInput1 (keyup.enter)="search(searchInput1.value)" class="prompt" type="text" placeholder="Search Anime">
                <i class="search icon"></i>
            </div>
        </div>
        <div *ngIf="showPacks" class=" row computer only">        
            <div class="ui horizontal divider"> Search results for {{searchquery}} </div>
            <div class="row">
                <div class="ui items" id="searchResults" *ngFor="let anime of results">
                    <div (click)="showPackListFor(anime)" class="item" >
                        <div class="ui tiny image"> 
                            <img src="{{anime.image_url_med}}" /> 
                        </div>
                        <div class="middle aligned content">
                            <a class="header">{{anime.title_english}}</a>
                        </div>
                    </div> 
                    <div class="ui divider" > </div>
                </div>
            </div>
        </div>
        <div *ngIf="showError" class="row computer only">        
            <h3> Sorry, we couldn't find what you searched for :(. </h3>
        </div>

        <div class="row mobile only" style="margin-left: 30%;" >
            <div class="ui horizontal divider">SEARCH</div>
            <div class="ui icon input"  style="width: 100%;">
                <input #searchInput2 (keyup.enter)="search(searchInput2.value)" class="prompt" type="text" placeholder="Search Anime">
                <i class="search icon"></i>
            </div>
        </div>
        <div *ngIf="showPacks"  class="thirteen wide row mobile only " style="margin-left:20%;">
            <div class="ui styled accordion"   style=" width: 100%; ">
                <div class="content">
                    <div class="ui items"  id="currentlyAiringAnimes"  >      
                        <div (click)="showPackListFor(anime)" *ngFor="let anime of results" class="item">
                            <div class="ui grid">
                                <div class="column four wide">
                                    <img src="{{anime.image_url_med}}" style="max-width: 100%;"    /> 
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
         <div *ngIf="showError" class="row thirteen wide mobile only" style="margin-left: 20%;" >        
            <h3> Sorry, we couldn't find what you searched for :(. </h3>
        </div>
    </div>
    `,
})
export class Search {
    
    showPacks : boolean;
    showError : boolean;
    searchquery : string;
    results : any;

    //setup search component
    constructor(private niblService : NiblService, private shareService : ShareService, private aniListService : AniListService, private router:Router){
        this.showPacks = false;
        this.showError = false;
        this.searchquery = "nothing searched";

       
    }

    //listens to search request  (subscribe holds the search query so if everything works alright everytime you go to this page you will see your latest search )
    ngOnInit(){

        if(this.shareService.getStoredSearchToView() != null){
            this.searchquery = this.shareService.getLastSearched();
            this.results = this.shareService.getStoredSearchToView();
            this.showPacks = true;
        }

        
    }

    //searches the anime using the Atarashii/Mal api
    async search(searchQuery:string){

        this.shareService.showLoaderMessage("Searching for: " + searchQuery);
        console.log(searchQuery);
        if(this.shareService.getLastSearched() != searchQuery){
            try{
            
                this.showPacks = false;
                console.log("searching for: " + searchQuery);
                this.searchquery = searchQuery;
                this.results =  await this.aniListService.searchAnime(searchQuery);
                this.shareService.storeSearchToView(this.results);
                console.log(this.results);
                this.showPacks = true;
            } catch(e){
                this.showError = true;
            }
        } else {
            this.results= this.shareService.getStoredSearchToView();
            console.log(this.results);
            this.showPacks = true;
        }
        
        this.shareService.storeSearchRequest(searchQuery);
        this.shareService.hideLoader();    
    }

    //when an anime is found and you click on it, show the packlist component
    async showPackListFor(anime : any){
       
        console.log(anime);     
        this.shareService.setAnimeTitle(anime);
        this.router.navigate(['packlist']);   

    }
}