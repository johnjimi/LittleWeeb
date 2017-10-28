import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

//main components
import { AppComponent }  from './app.component';

//body components
import { MenuComponent } from './components/menu.component';

//view components
import { CurrentlyAiring } from './components/views/currentlyairing.component';
import { Search } from './components/views/search.component';
import { Downloads } from './components/views/downloads.component';
import { Settings } from './components/views/settings.component';
import { About } from './components/views/about.component';
import { PackList } from './components/views/packlist.component';

//extra components
import { Toaster } from './components/extras/toaster.component';
import { Loader} from './components/extras/loader.component';
import { Modal} from './components/extras/modal.component';

//services
import {NiblService} from './services/nibl.service'
import {ShareService} from './services/share.service'
import {UtilityService} from './services/utility.service'
import {BackEndService} from './services/backend.service'
import {SemanticService} from './services/semanticui.service'
import {MalService} from './services/mal.service'
import {VersionService} from './services/versioncheck.service'
//view routes
const appRoutes: Routes = [
  {
    path: 'currentlyairing',
    component: CurrentlyAiring,
    data: { title: 'Currently Airing' }
  },
  {
    path: 'search',
    component: Search,
    data: { title: 'Search' }
  },
  {
    path: 'downloads',
    component: Downloads,
    data: { title: 'Downloads' }
  },
  {
    path: 'settings',
    component: Settings,
    data: { title: 'Settings' }
  },
  {
    path: 'about',
    component: About,
    data: { title: 'About' }
  },
  {
    path: 'packlist',
    component: PackList,
    data: { title: 'Pack List' }
  },
  { path: '',
    redirectTo: 'currentlyairing',
    pathMatch: 'full'
  }
];

@NgModule({
  imports:      [ BrowserModule,  RouterModule.forRoot(appRoutes, { enableTracing: true }), FormsModule, HttpModule, CommonModule, ToasterModule, BrowserAnimationsModule, NoopAnimationsModule],
  declarations: [ AppComponent, MenuComponent, CurrentlyAiring, Search, Downloads, Settings, About, PackList, Toaster, Loader, Modal ],
  bootstrap:    [ AppComponent ],
  providers: [NiblService, UtilityService, ShareService, BackEndService, SemanticService, MalService, VersionService]
})
export class AppModule { }
