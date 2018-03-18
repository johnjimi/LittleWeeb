import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class ShareService {

    public packlistsub : Subject<string> = new BehaviorSubject<string>(null);
    public animetitlesub : Subject<any> = new BehaviorSubject<any>(null);
    public updatetitle : Subject<string> = new BehaviorSubject<string>(null);
    public downloadamount : Subject<number> = new BehaviorSubject<number>(null);
    public favoriteamount : Subject<number> = new BehaviorSubject<number>(null);
    public toastmessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public loaderMessage : Subject<string> = new BehaviorSubject<string>(null);
    public modalMessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public showFileDialogEvent : Subject<Boolean> = new BehaviorSubject<Boolean>(null);
    public searchQuery : Subject<string> = new BehaviorSubject<string>(null);
    public botlist : Object;
    public isLocal : boolean;
    public searchStrictness : number = 25;
    public baseDownloadDirectory :string;

    public defaultResolution : string = '720p';

    private currentlyAiringToView : any;
    private animeToView : any;
    private episodesToView: any[];
    private moviesToView : any[];
    private searchToView : any;
    private lastSearch : string;
    private favoritecount : number = 0;
    

    //this service shares information between different components, be it services, views or extras.
    constructor(){
        this.animeToView = null;
        this.currentlyAiringToView = null;
        this.searchToView = null;
        this.episodesToView = null;
        this.lastSearch = "";
        this.isLocal = true;
    }


    storeCurrentlyAiring(tostore: any){
        this.currentlyAiringToView = tostore;
    }

    storeAnimeToView(currentAnime: any, episodes:any[], movies:any[]){
        this.animeToView = currentAnime;
        this.episodesToView = episodes;
        this.moviesToView = movies;
    }

    storeSearchToView(tostore: any){
        this.searchToView = tostore;
    }
    
    storeSearchRequest(tostore: string){
        this.lastSearch = tostore;
        this.searchQuery.next(this.lastSearch);
    }

    getStoredCurrentlyAiring(){
        return this.currentlyAiringToView;
    }

    getStoredAnimeToView(){
        return this.animeToView;
    }

    getStoredEpisodesToView(){
        return this.episodesToView;
    }

    getStoredMoviesToView(){
        return this.moviesToView;
    }

    getStoredSearchToView(){
        console.log("get already stored");
        return this.searchToView;
    }

    getLastSearched(){
        return this.lastSearch;
    }
    
    //for views/packlist.component
    getBotList(){
        return this.botlist;
    }

    //for views/packlist.component
    setBotList(newbotlist : Object){
        this.botlist = newbotlist;
    }

    //for views/packlist.component
    clearBotList(){
        this.botlist = null;
    }

    //for views/packlist.component
    setAnimeTitle(anime: any){
        this.animetitlesub.next(anime);
    }

    //for views/packlist.component
    clearAnimeTitle(){
        this.animetitlesub.next();
    }

    //for views/packlist.component
    setPackList(json : any){
        var jsoncombined = JSON.stringify(json);
        this.packlistsub.next(JSON.stringify(jsoncombined));
    }
    
    //for views/packlist.component
    clearPackList(){
        this.packlistsub.next();
    }   

    //for menu.component
    updateAmountOfDownloads(num:number){
        this.downloadamount.next(num);
    }    
   
    //for extras/toaster.component
    showMessage(type: string, msg:string){
        var tobeshown = [type, msg];
        this.toastmessage.next(tobeshown);
    }

    //for extras/loader.component
    showLoaderMessage(message: string){
        this.loaderMessage.next(message);
    }

    //for extras/loader.component
    showLoader(){
        this.loaderMessage.next("Loading");
    }

    //for extras/loader.component
    hideLoader(){
        this.loaderMessage.next("HIDELOADER");
    }

    //for extras/modal.component
    showModal(title:string,message:string,icon:string,actions:string){
        var combine = [title,message,icon,actions];
        this.modalMessage.next(combine);
    }

    //for extras/modal.component
    hideModal(){
        var combine = ["HIDE"];
        this.modalMessage.next(combine);
    }

    //for extras/filedailog.component
    showFileDialog(){
        this.showFileDialogEvent.next(true);
    }

    //for extras/filedailog.component
    hideFileDialog(){
        this.showFileDialogEvent.next(false);
    }

    addFavoriteAnime(fullanime: any){
        let getCurrentFavorites = this.getDataLocal("favorites");
        if(!getCurrentFavorites){
            let newFavoritesObject = {"favorites" : [fullanime]};
            this.storeDataLocal("favorites", JSON.stringify(newFavoritesObject));
            this.favoritecount++;
            this.favoriteamount.next(this.favoritecount);
        } else {
            let currentFavorites = JSON.parse(getCurrentFavorites);
            let found = false;
            for(let currentfavorite of currentFavorites.favorites){
                if(currentfavorite.id == fullanime.id){
                    found = true;
                    break;
                }
            }
            if(!found){
                currentFavorites.favorites.push(fullanime);
                this.storeDataLocal("favorites", JSON.stringify(currentFavorites));
            }
            this.favoritecount = currentFavorites.favorites.length;
            this.favoriteamount.next(this.favoritecount);
        }
    }

    getFavoritAnimeCount(){
        let getCurrentFavorites = this.getDataLocal("favorites");
        if(getCurrentFavorites){
             let currentFavorites = JSON.parse(getCurrentFavorites);
             this.favoritecount = currentFavorites.favorites.length;
             this.favoriteamount.next(this.favoritecount);
        }
    }

    removeFavoriteAnime(id : string){
        let getCurrentFavorites = this.getDataLocal("favorites");
        if(getCurrentFavorites){
            let currentFavorites = JSON.parse(getCurrentFavorites);

            let index = 0;
            for(let currentFavorite of currentFavorites.favorites){
                if(currentFavorite.id == id){
                    break;
                }
                index++;
            }

            currentFavorites.favorites.splice(index, 1);

            this.storeDataLocal("favorites", JSON.stringify(currentFavorites));
            
            this.favoritecount = currentFavorites.favorites.length;
            this.favoriteamount.next(this.favoritecount);
        }    
    }

    //LocalStorage Stuff
    storeDataLocal(key:string, data:string){
        return localStorage.setItem(key, data) || false;
    }

    getDataLocal(key : string){
        return localStorage.getItem(key) || false;
    }

}