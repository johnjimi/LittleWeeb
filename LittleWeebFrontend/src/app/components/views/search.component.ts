import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {MalService} from '../../services/mal.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Component({
    selector: 'search',
    template: `
        <div class="row" style="width: 100%;">
            <div class="ui horizontal divider">SEARCH</div>
            <div class="ui icon input"  style="width: 100%;">
                <input #searchInput (keyup.enter)="search(searchInput.value)" class="prompt" type="text" placeholder="Search Anime">
                <i class="search icon"></i>
            </div>
        </div>
        <div *ngIf="showPacks">        
            <div class="ui horizontal divider"> Search results for {{searchquery}} </div>
            <div class="row">
                <div class="ui items" id="searchResults" *ngFor="let anime of results">
                    <div (click)="showPackListFor(anime)" class="item" >
                        <div class="ui tiny image"> 
                            <img src="{{anime.image_url}}" /> 
                        </div>
                        <div class="middle aligned content">
                            <a class="header">{{anime.title}}</a>
                        </div>
                    </div> 
                    <div class="ui divider" > </div>
                </div>
            </div>
        </div>
         <div *ngIf="showPacks">        
            <h3> Sorry, we couldn't find what you searched for :(. </h3>
        </div>
    `,
})
export class Search {
    
    showPacks : boolean;
    showError : boolean;
    searchquery : string;
    results : any;

    //setup search component
    constructor(private niblService : NiblService, private shareService : ShareService, private malService : MalService, private router:Router){
        this.showPacks = false;
        this.showError = false;
        this.searchquery = "nothing searched";
    }

    //searches the anime using the Atarashii/Mal api
    async search(value:string){
        this.shareService.showLoaderMessage("Searching for: " + value);
        try{

            this.showPacks = false;
            console.log("searching for: " + value);
            this.searchquery = value;
            this.results =  await this.malService.searchAnime(value);
            console.log(this.results);
            this.showPacks = true;
        } catch(e){
            this.showError = true;
        }
        this.shareService.hideLoader();
    }

    //when an anime is found and you click on it, show the packlist component
    showPackListFor(anime : any){
        console.log(anime);
        var convert = {"title_english" : anime.title, "type" : anime.type};        
        this.shareService.setAnimeTitle(convert);
        this.router.navigate(['packlist']);   

    }
}