import {Component} from '@angular/core';
import {ShareService} from '../../services/share.service'
import {SemanticService} from '../../services/semanticui.service'
@Component({
    selector: 'modal',
    templateUrl: './html/modal.component.html',
    styleUrls: ['./css/modal.component.css']
})
//these should be shown in the main component/parent component (in this case thats app.component.ts)
export class Modal {
    messageTitle : string;
    messageBody : string;
    messageIcon : string;
    actions : string;
    //shows a modal screen with a message and possible actions 
    constructor(private shareService:ShareService, private semanticService:SemanticService){
        this.semanticService.hideModal('.ui.basic.modal.message');
        this.shareService.modalMessage.subscribe(message=>{
            
                    
            console.log(message);
            if(message != null){
               
                if(message[0] != "HIDE"){
                     //showloader with message
                     this.messageTitle = message[0];
                     this.messageBody= message[1];
                     this.messageIcon = message[2];
                     this.actions = message[3];
                     this.semanticService.showModal('.ui.basic.modal.message');
                } else {
                     this.semanticService.hideModal('.ui.basic.modal.message');
                }
            } 
        });
    }
}