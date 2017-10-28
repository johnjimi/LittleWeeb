import {Component, OnInit} from '@angular/core';
import {ShareService} from '../services/share.service'


@Component({
    selector: 'menutag',
    template: `
        <div class="ui grey secondary vertical pointing menu fixed" style="height: 100%">
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
            title: 'Packlist',
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
    }

}


interface menuItemToAdd {
    title: string;
    icon : string;
    view : string;
}
