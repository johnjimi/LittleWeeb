import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {SemanticService} from '../../services/semanticui.service'
@Component({
    selector: 'loader',
    templateUrl: './html/loader.component.html',
    styleUrls: ['./css/loader.component.css']
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
                     this.openLoader(message);
                } else {
                     this.closeLoader();
                }
            } else {
               this.openLoader("Loading");
            }
        });
    }

    closeLoader(){
        this.showLoader = false;
        this.semanticService.hideObject('.element');
        this.zindex = -100;
    }

    openLoader(message: string){
        this.message =  message;
        this.showLoader = true;
        this.zindex = 100;
        this.semanticService.showObject('.element');
    }
}