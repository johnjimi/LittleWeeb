import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {KitsuService} from '../../services/kitsu.service'
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
    templateUrl: './html/currentlyairing.component.html',
    styleUrls: ['./css/currentlyairing.component.css']
})
export class CurrentlyAiring {
    latestAired : any;
    currentlyAiringLoading : boolean;
    waitForDataInterval : any;
    animeTitle : string;
    showCurAir : boolean;
    showAnime : boolean;
    daysArray : any;
    fulltitle : string;
    private today : string;
    private modalToShow : number;
    //gets the currently airing anime from the Nibl API
    constructor(private semanticui:SemanticService, private kitsuService: KitsuService, private shareService: ShareService, private utilityService: UtilityService, private backendService : BackEndService, private router: Router){
        this.currentlyAiringLoading = false;
        this.animeTitle = "Anime";
        this.showCurAir = true;
        this.showAnime = false;
        this.daysArray = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    }
    async ngOnInit(){
        this.shareService.showLoaderMessage("Loading currently airing!");


        var data;
        var retreiveAiring = this.shareService.getDataLocal("Airing");
        if(retreiveAiring  != false){
                         
              
            var airing = JSON.parse(retreiveAiring);
            var seconds = new Date().getTime() / 1000;
            console.log(seconds - airing.currentTime);
            this.shareService.showMessage("succes", "Loading Cached CurrentlyAiring - aprox " + Math.round((seconds - airing.currentTime)) + " before refresh!"); 
            this.latestAired = airing.airing; 
            this.showCurAir = true;
            this.shareService.hideLoader();
            if(seconds - airing.currentTime > 300){
                
                this.shareService.showMessage("succes", "Updating currently airing - takes 15 seconds."); 
                setTimeout(()=>{
                     this.shareService.showMessage("succes", "Updating currently airing - takes 10 seconds."); 
                }, 5000);
                setTimeout(()=>{
                    this.shareService.showMessage("succes", "Updating currently airing - takes 5 seconds."); 
                }, 10000);
                this.kitsuService.getAllCurrentlyAiring().subscribe((result)=>{
                    seconds = new Date().getTime() / 1000;
                    this.shareService.storeDataLocal("Airing",JSON.stringify( {currentTime: seconds, airing: result }));
                    this.latestAired = result;  
                    this.shareService.showMessage("succes", "Currently Airing Updated!");          
                });
            }
            
        } else {
            this.kitsuService.getAllCurrentlyAiring().subscribe((result)=>{
                var seconds = new Date().getTime() / 1000;
                this.shareService.storeDataLocal("Airing",JSON.stringify( {currentTime: seconds, airing: result }));
                this.latestAired = result;                
                this.showCurAir = true;
                this.shareService.hideLoader();
            });
        }
        
        
           
    }


    setPopUpContent(animetitle: string){
        
        this.fulltitle = animetitle;
        
    }

    //to redirect to packlist
    showPackListFor(anime : any){
        console.log(anime);
        this.shareService.showLoader();
        this.shareService.setAnimeTitle(anime);
        this.router.navigate(['packlist']);      
    }


}
