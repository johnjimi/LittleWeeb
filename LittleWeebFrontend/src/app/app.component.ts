import { Component, OnInit,  HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Toaster} from './components/extras/toaster.component'
import {Loader} from './components/extras/loader.component'
import {Modal} from './components/extras/modal.component'
import {FileDialog} from './components/extras/filedialog.component'
import {ShareService} from './services/share.service'
import {VersionService} from './services/versioncheck.service'
import {BackEndService} from './services/backend.service'
import {MalService} from './services/mal.service'
import {AniListService} from './services/anilist.service'
@Component({
  selector: 'my-app',
  template: `
           
        
            <div class="ui bottom attached segment pushable">             
                <div class="ui secondary pointing three fixed item menu phoneContent">
                
                        <a class="ui item" (click)="openCloseMenu()">
                           <i class="sidebar icon ">  </i> Menu
                        </a> 
                        <a class="ui item" routerLink="currentlyairing" routerLinkActive="active" >
                         <h4>LittleWeeb - Alpha </h4>
                        </a>
                         <a class="ui item" routerLink="about" routerLinkActive="active">
                           <i class="info icon ">  </i> About
                        </a>
                       
                </div>

                <div class="ui visible inverted left vertical custom-fixed sidebar menu deskContent ">
                    <div class="ui horizontal divider white-text"> LilleWeebie - v0.4.0 </div>
                    <div *ngFor="let menuItem of menuItems">
                        <a class="item" routerLink="{{menuItem.view}}" routerLinkActive="active">
                            <i class="{{menuItem.icon}} icon "></i> {{menuItem.title}}
                        </a>
                    </div> 
                
                </div>

                <div *ngIf="showMenu" class="ui visible inverted left vertical sidebar menu phoneContent">
                    <div class="ui horizontal divider white-text"> LilleWeebie - v0.3.2 </div>
                    <div *ngFor="let menuItem of menuItems">
                        <a class="item" routerLink="{{menuItem.view}}" routerLinkActive="active" (click)="openCloseMenu()">
                            <i class="{{menuItem.icon}} icon "></i> {{menuItem.title}}
                        </a>
                    </div>                 
                </div>

                
                <div class="pusher overflow-y-scrollable pusher-extra max-height-size-depended" (click)="closeMenu()">
                    <router-outlet></router-outlet>
                    
                    <toaster></toaster>
                    <loader></loader>
                    <modal></modal>
                    <filedialog></filedialog>
                        
                </div>
            </div>
    
 
  `
})
export class AppComponent  { 

    menuItems : menuItemToAdd[];
    menuItemToAdd : menuItemToAdd;
    someFunctionToCall : Function;
    showMenu : boolean;
    constructor(private aniListService:AniListService, private shareServices: ShareService, private versionService: VersionService, private backEndService: BackEndService, private router: ActivatedRoute, private malService : MalService ){
        this.showMenu = false;
        console.log("Menu Succesfully Loaded!");
        this.menuItems = [];
        this.menuItemToAdd = {
            title: 'Currently Airing',
            icon: 'add to calendar',
            view : 'currentlyairing'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Search',
            icon: 'search',
            view : 'search'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Favorites',
            icon: 'favorite',
            view : 'favorites'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Choose Anime',
            icon: 'film',
            view : 'packlist'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Downloads',
            icon: 'download',
            view : 'downloads'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Settings',
            icon: 'settings',
            view : 'settings'
        }
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'About',
            icon: 'info',
            view : 'about'
        }
        this.menuItems.push(this.menuItemToAdd);
    }

    async ngOnInit(){
        var ip =  window.location.hostname;

        if(ip.length < 4){
            ip = "127.0.0.1";
        }


        this.backEndService.tryConnecting(ip);
        this.malService.setIp(ip);
        this.versionService.getVersion();
     
        this.shareServices.getFavoritAnimeCount();
            
        this.shareServices.downloadamount.subscribe(amount=>{
            if(amount != null){
                if(amount == 0){                    
                    this.menuItems[4] = {
                        title: 'Downloads',
                        icon: 'download',
                        view : 'downloads'
                    };
                } else {

                    this.menuItems[4] = {
                        title: 'Downloads - ' + amount,
                        icon: 'download',
                        view : 'downloads'
                    };
                }
            }
            
        });

        this.shareServices.updatetitle.subscribe((animetitle) => {
            console.log("animetitle did execute in menu");
            if(animetitle !== undefined){
                try{

                    this.menuItems[3] =  {
                        title: animetitle,
                        icon: 'film',
                        view : 'packlist'
                    };
                } catch(e){
                    this.menuItems[3] =  {
                        title: 'Choose Anime',
                        icon: 'film',
                        view : 'packlist'
                    };
                }
            }

        }); 

        this.shareServices.animetitlesub.subscribe((anime) => {
            console.log("animetitle did execute in menu");
            if(anime !== undefined){
                try{

                    this.menuItems[3] =  {
                        title: anime.attributes.canonicalTitle,
                        icon: 'film',
                        view : 'packlist'
                    };
                } catch(e){
                    this.menuItems[3] =  {
                        title: 'Choose Anime',
                        icon: 'film',
                        view : 'packlist'
                    };
                }
            }

        }); 

        this.shareServices.searchQuery.subscribe((search) => {
            console.log("animetitle did execute in menu");
            if(search !== undefined && search != null){
                try{

                    this.menuItems[1] =  {
                        title: "Current Search: " + search,
                        icon: 'search',
                        view : 'search'
                    };
                } catch(e){
                    this.menuItems[1] =  {
                        title: "Search",
                        icon: 'search',
                        view : 'search'
                    };
                }
            }

        }); 

        this.shareServices.favoriteamount.subscribe(amount=>{
            if(amount != null){
                if(amount == 0){                    
                    this.menuItems[2] = {
                        title: 'Favorites',
                        icon: 'favorite',
                        view : 'favorites'
                    };
                } else {

                    this.menuItems[2] = {
                        title: 'Favorites - ' + amount,
                        icon: 'favorite',
                        view : 'favorites'
                    };
                }
            }
            
        });
    }

  

    @HostListener('window:beforeunload')
    doSomething() {
        this.backEndService.sendMessage({"action" : "disconnect_irc"});
    }

    openCloseMenu(){
        if(this.showMenu){
            this.showMenu = false;
        } else {
            this.showMenu = true;
        }
    }

    openMenu(){
        this.showMenu = true;
    }

    closeMenu(){
        this.showMenu = false;
    }

}

interface menuItemToAdd {
    title: string;
    icon : string;
    view : string;
}
