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

/**
 * (VIEW) Shows Search view,
 * Search Component class enables users to search for animes.
 * 
 * @export
 * @class Search
 */
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

    /**
    * Creates an instance of Search.
    * @param {ShareService} shareService (used for sharing and receiving information from other components & services )
    * @param {KitsuService} kitsuService (used for communicating with kitsu's API)
    * @param {Router} router (used for redirecting if needed)
    * @memberof Search
    */
    constructor(private shareService : ShareService, private kitsuService : KitsuService, private router:Router){
        this.showPacks = false;
        this.showError = false;
        this.searchquery = "nothing searched";
    }

   /**
    * Runs everytime and checks if the search query has already been executed before, and shows the results if it has, so that it doesnt 
    * need to execute the query each time you switch between the search view and other views.
    * 
    * @memberof Search
    */
   ngOnInit(){
        let previousSearch = this.shareService.getDataLocal("animesearch");
        if(previousSearch != false){
            console.log("PREVSEARCH:");
            console.log(previousSearch);
            let search = JSON.parse(previousSearch);
            this.searchquery = search.query;
            this.results = search.result;
            this.shareService.searchQuery.next(this.searchquery);
            this.showPacks = true;
        }  
    }

    /**
     * Async method for executing a search query and stores it using localstorage
     * 
     * @param {string} searchQuery (contains the search query)
     * @memberof Search
     */
    async search(searchQuery:string){
        this.shareService.showLoaderMessage("Searching for: " + searchQuery);

        let previousSearch = this.shareService.getDataLocal("animesearch");
        console.log("PREVSEARCH:");
        console.log(previousSearch);
        if(previousSearch != false){
            let search = JSON.parse(previousSearch);
            console.log(search);
            if(searchQuery != search.query){
                this.showPacks = false;
                this.searchquery = searchQuery;                
                this.shareService.searchQuery.next(this.searchquery);
                this.results =  await this.kitsuService.searchAnime(searchQuery, 20);

                let newSearchResult = {query : searchQuery, result: this.results};
                this.shareService.storeDataLocal("animesearch", JSON.stringify(newSearchResult));

                console.log(this.results);
                this.showPacks = true;
            } else {
                this.searchquery = search.query;
                this.results = search.result;
                this.shareService.searchQuery.next(this.searchquery);
            }
        } else {
            this.showPacks = false;
                this.searchquery = searchQuery;                
                this.shareService.searchQuery.next(this.searchquery);
                this.results =  await this.kitsuService.searchAnime(searchQuery, 20);

                let newSearchResult = {query : searchQuery, result: this.results};
                this.shareService.storeDataLocal("animesearch", JSON.stringify(newSearchResult));

                console.log(this.results);
                this.showPacks = true;
        }
       
        this.shareService.hideLoader();    
    }

    /**
     * Used to show the full title if the user hovers over a card with anime information 
     * 
     * @param {string} animetitle 
     * @memberof Search
     */
    setPopUpContent(animetitle: string){        
        this.fulltitle = animetitle;        
    }

    /**
     * Opens Component: animeinfo.component.ts to show anime information when the user clicks on one of the results (shown as anime cover + title)
     * 
     * @param {*} anime (anime json object for the anime that the user clicked on)
     * @memberof Search
     */
    async showAnimeInfoFor(anime : any){
       
        console.log(anime);     
        
        this.shareService.animetoshow.next(anime);
        this.router.navigate(['animeinfo']);   

    }


}