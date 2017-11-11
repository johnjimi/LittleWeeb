import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/Rx';

@Injectable()
export class ShareService {

    public packlistsub : Subject<string> = new BehaviorSubject<string>(null);
    public animetitlesub : Subject<any> = new BehaviorSubject<any>(null);
    public downloadamount : Subject<number> = new BehaviorSubject<number>(null);
    public toastmessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public loaderMessage : Subject<string> = new BehaviorSubject<string>(null);
    public modalMessage : Subject<string[]> = new BehaviorSubject<string[]>(null);
    public searchQuery : Subject<string> = new BehaviorSubject<string>(null);
    public botlist : Object;

    private currentlyAiringToView : any;
    private animeToView : any;
    private episodesToView: any[];
    private searchToView : any;
    private lastSearch : string;

    //this service shares information between different components, be it services, views or extras.
    constructor(){
        this.animeToView = null;
        this.currentlyAiringToView = null;
        this.searchToView = null;
        this.episodesToView = null;
        this.lastSearch = "";
    }

    storeCurrentlyAiring(tostore: any){
        this.currentlyAiringToView = tostore;
    }
    storeAnimeToView(currentAnime: any, episodes:any[]){
        this.animeToView = currentAnime;
        this.episodesToView = episodes;
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

}