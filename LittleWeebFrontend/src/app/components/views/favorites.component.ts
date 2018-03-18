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
    selector: 'favorites',
    templateUrl: './html/favorites.component.html',
    styleUrls: ['./css/favorites.component.css']
})
export class Favorites {
    favoriteAnimes : any;
    showFavorites : boolean;
    fulltitle: string;
    //gets the currently airing anime from the Nibl API
    constructor(private semanticui:SemanticService, private aniListService: AniListService, private shareService: ShareService, private utilityService: UtilityService, private backendService : BackEndService, private router: Router){
        let getCurrentFavorites = this.shareService.getDataLocal("favorites");
        if(!getCurrentFavorites){
            this.showFavorites = false;
            this.favoriteAnimes = [];
        } else {
            let currentFavorites = JSON.parse(getCurrentFavorites);
            this.favoriteAnimes = currentFavorites.favorites;
            this.showFavorites = true;
        }    

    }
    async ngOnInit(){
        
           
    }

    removeFromFavorites(id : string){
        this.shareService.removeFavoriteAnime(id);
        let getCurrentFavorites = this.shareService.getDataLocal("favorites");
        if(!getCurrentFavorites){
            this.showFavorites = false;
            this.favoriteAnimes = [];
        } else {
            let currentFavorites = JSON.parse(getCurrentFavorites);         
            
            this.favoriteAnimes = currentFavorites.favorites;
            this.showFavorites = true;
        }    
    }
    
    //to redirect to packlist
    showPackListFor(anime : any){
        console.log(anime);
        this.shareService.setAnimeTitle(anime);
        this.router.navigate(['packlist']);      
    }

     setPopUpContent(animetitle: string){
        
        this.fulltitle = animetitle;
        
    }
}
