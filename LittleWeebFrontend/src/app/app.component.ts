import { Component, OnInit } from '@angular/core';
import {Toaster} from './components/extras/toaster.component'
import {Loader} from './components/extras/loader.component'
import {Modal} from './components/extras/modal.component'
import {ShareService} from './services/share.service'
import {VersionService} from './services/versioncheck.service'
@Component({
  selector: 'my-app',
  template: `
  <div class="ui grid">
      <div class="four wide column">
          <menutag></menutag>
      </div>
      <div class="ten wide column">        
        <router-outlet></router-outlet>
      </div>
  </div>
  <toaster></toaster>
  <loader></loader>
  <modal></modal>
  `,
})
export class AppComponent  { 

  someFunctionToCall : Function;
  constructor(private shareService: ShareService, private versionService: VersionService){
     this.shareService.hideLoader();
     this.someFunctionToCall = ()=>{
       console.log("this works")
     }
  }

  async ngOnInit(){
    
     this.versionService.getVersion();
  }

}
