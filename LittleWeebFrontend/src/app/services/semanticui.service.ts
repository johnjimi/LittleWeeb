import {Injectable} from '@angular/core';
declare var $:any;
@Injectable()
export class SemanticService {
  
    //this service handles jQuery(UGH) calls for the semantic-ui css framework 
    //I will probably change to another framework when the time comes (but this works i guess)
    constructor(){
        
    }   
    
    enableDropDown(){
        setTimeout(()=>{
            $('.ui.dropdown').dropdown();
        }, 1);
    }

    enableAccordion(){
        setTimeout(()=>{
            $('.ui.accordion').accordion({exclusive: false});
        }, 1);
    }

    openAccordion(index:string){
        setTimeout(()=>{
            $('.ui.accordion').accordion('open', index);
        }, 1);
    }

    closeAccordion(index:string){
        setTimeout(()=>{
            $('.ui.accordion').accordion('close', index);
        }, 1);
    }

    updateProgress(progressbar: string, progress: string){
        setTimeout(()=>{
            $(progressbar).progress({
                percent: progress
            });
        }, 1);
    }

    hideObject(object: string){
        $(object).dimmer('hide');
    }

    showObject(object: string){
        $(object).dimmer('show');
    }

    hideModal(modal :string){
        $(modal).modal('hide');
    }

    showModal(modal:string){
        $(modal).modal('show');
    }

}