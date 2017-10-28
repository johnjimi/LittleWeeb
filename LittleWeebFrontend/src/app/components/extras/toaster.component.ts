import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {ToasterModule, ToasterService} from 'angular2-toaster';
@Component({
    selector: 'toaster',
    template: `<toaster-container></toaster-container>`,
})
//these should be shown in the main component/parent component (in this case thats app.component.ts)
export class Toaster {
    //shows a toaster message
    constructor(private shareService:ShareService, private toasterService:ToasterService){
        this.shareService.toastmessage.subscribe(message=>{
            console.log(message);
            if(message != null){
                this.toasterService.pop(message[0], message[1]);
            }
        });
    }
}