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
  <div class="ui grid" >
      <div class="three wide column">
          <menutag></menutag>
      </div>
      <div class="twelve wide column">        
        <router-outlet></router-outlet>
      </div>
  </div>
  <toaster></toaster>
  <loader></loader>
  <modal></modal>
  <filedialog></filedialog>
  `
})
export class AppComponent  { 

  someFunctionToCall : Function;
  constructor(private aniListService:AniListService, private shareService: ShareService, private versionService: VersionService, private backEndService: BackEndService, private router: ActivatedRoute, private malService : MalService ){

  }

  async ngOnInit(){
     var ip =  window.location.hostname;
     this.backEndService.tryConnecting(ip);
     this.malService.setIp(ip);
     this.versionService.getVersion();
  }

  @HostListener('window:beforeunload')
  doSomething() {
    this.backEndService.sendMessage({"action" : "disconnect_irc"});
  }

}
