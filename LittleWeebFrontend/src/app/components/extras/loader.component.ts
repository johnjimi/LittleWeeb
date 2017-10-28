import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {SemanticService} from '../../services/semanticui.service'
@Component({
    selector: 'loader',
    template: `
                <div class="ui dimmer" [ngClass]="{active: showLoader}" style="height: 100%; width: 100%;" [ngStyle]="{'z-index': zindex}">
                    <div class="ui massive text loader">{{message}}</div>
                </div>
                <p></p>
                <p></p>
                <p></p>`,
})

//these should be shown in the main component/parent component (in this case thats app.component.ts)
export class Loader {
    message : string;
    showLoader : boolean;
    zindex : number;
    //shows a loading screen with or without a message
    constructor(private shareService:ShareService, private semanticService:SemanticService){
        this.showLoader = false;
        this.shareService.loaderMessage.subscribe(message=>{    
            console.log(message);
            if(message != null){
               
                if(message != "HIDELOADER"){
                     //showloader with message
                     this.message = message;
                     this.showLoader = true;
                     this.zindex = 100;
                     semanticService.showObject('.element');
                } else {
                     this.showLoader = false;
                     semanticService.hideObject('.element');
                     this.zindex = -100;
                }
            } else {
                this.message =  "Loading";
                this.showLoader = true;
                this.zindex = 100;
                semanticService.showObject('.element');
            }
        });
    }
}