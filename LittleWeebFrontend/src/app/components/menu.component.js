"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require("@angular/core");
let MenuComponent = class MenuComponent {
    constructor() {
        console.log("Menu Succesfully Loaded!");
        this.menuItems = [];
        this.menuItemToAdd = {
            title: 'Currently Airing',
            icon: 'add to calendar',
            view: 'currentlyairing'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Packlist',
            icon: 'add to calendar',
            view: 'packlist'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Latest XDCC Pack',
            icon: 'add to calendar',
            view: 'latestpack'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Search',
            icon: 'search',
            view: 'search'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Bot List',
            icon: 'disk outline',
            view: 'botlist'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Downloads',
            icon: 'download',
            view: 'downloads'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'Settings',
            icon: 'settings',
            view: 'settings'
        };
        this.menuItems.push(this.menuItemToAdd);
        this.menuItemToAdd = {
            title: 'About',
            icon: 'info',
            view: 'about'
        };
        this.menuItems.push(this.menuItemToAdd);
    }
};
MenuComponent = __decorate([
    core_1.Component({
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
    }),
    __metadata("design:paramtypes", [])
], MenuComponent);
exports.MenuComponent = MenuComponent;
//# sourceMappingURL=menu.component.js.map