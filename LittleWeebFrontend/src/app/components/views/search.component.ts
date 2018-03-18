import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {NiblService} from '../../services/nibl.service'
import {ShareService} from '../../services/share.service'
import {UtilityService} from '../../services/utility.service'
import {KitsuService} from '../../services/kitsu.service'
import {Subject} from 'rxjs/Rx';
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Component({
    selector: 'search',
    templateUrl: './html/search.component.html',
    styleUrls: ['./css/search.component.css']
})
export class Search {
    
    showPacks : boolean;
    showError : boolean;
    searchquery : string;
    results : any;
    fulltitle: string;

    //setup search component
    constructor(private niblService : NiblService, private shareService : ShareService, private kitsuService : KitsuService, private router:Router){
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
                this.results =  await this.kitsuService.searchAnime(searchQuery, 20);
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

    setPopUpContent(animetitle: string){
        
        this.fulltitle = animetitle;
        
    }

    //when an anime is found and you click on it, show the packlist component
    async showPackListFor(anime : any){
       
        console.log(anime);     
        this.shareService.setAnimeTitle(anime);
        this.router.navigate(['packlist']);   

    }


}