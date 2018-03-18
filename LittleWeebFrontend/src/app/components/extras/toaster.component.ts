import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
@Component({
    selector: 'toaster',
    templateUrl: './html/toaster.component.html',
    styleUrls: ['./css/toaster.component.css']
})
//these should be shown in the main component/parent component (in this case thats app.component.ts)
export class Toaster {
    //shows a toaster message
    message : string;
    type : string;
    toasterclasses : string;
    constructor(private shareService:ShareService){
        this.shareService.toastmessage.subscribe(message=>{
            console.log(message);
            if(message != null){
                this.message = message[1];
                this.toasterclasses = "show " + message[0];
                setTimeout(()=>{
                    this.toasterclasses = "";
                }, 3000);
            }
        });
    }
}