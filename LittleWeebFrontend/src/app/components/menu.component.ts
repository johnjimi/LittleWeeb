import {Component, OnInit} from '@angular/core';
import {ShareService} from '../services/share.service'


@Component({
    selector: 'menutag',
    template: `
        <img src="http://orig13.deviantart.net/76a3/f/2013/232/d/9/shinobu_oshino_by_tobuei-d6ixzsk.png" style="position:fixed; top:10px; margin-left: 2%; width: 200px;" />
        <div style="margin-top: 110px;"></div>
        <div class="ui grey  vertical menu " style=" width: 200px; margin-left: 2%;  position:fixed;">
          <div class="ui horizontal divider">
            Little Weeb
          </div>
          <div *ngFor="let menuItem of menuItems">
            <a class="item" routerLink="{{menuItem.view}}" routerLinkActive="active">
                <i class="{{menuItem.icon}} icon "></i> {{menuItem.title}}
            </a>
          </div>
        </div>
        
    `,
})
export class MenuComponent {
    menuItems : menuItemToAdd[];
    menuItemToAdd : menuItemToAdd;
    //constructs the menu, this is where everything loads or doesn't load
    constructor(private shareServices:ShareService){
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
            title: 'Choose Anime',
            icon: 'add to calendar',
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

    //the menu has one menu item that shows the current amount of to be downloaded files, here it listens to updates to that number
    ngOnInit(){
        this.shareServices.downloadamount.subscribe(amount=>{
            if(amount != null){
                if(amount == 0){                    
                    this.menuItems[3] = {
                        title: 'Downloads',
                        icon: 'download',
                        view : 'downloads'
                    };
                } else {

                    this.menuItems[3] = {
                        title: 'Downloads - ' + amount,
                        icon: 'download',
                        view : 'downloads'
                    };
                }
            }
            
        });

        

        this.shareServices.animetitlesub.subscribe((anime) => {
            console.log("animetitle did execute in menu");
            if(anime !== undefined){
                try{

                    this.menuItems[2] =  {
                        title: anime.title,
                        icon: 'add to calendar',
                        view : 'packlist'
                    };
                } catch(e){
                    this.menuItems[2] =  {
                        title: 'Choose Anime',
                        icon: 'add to calendar',
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
    }

}


interface menuItemToAdd {
    title: string;
    icon : string;
    view : string;
}
