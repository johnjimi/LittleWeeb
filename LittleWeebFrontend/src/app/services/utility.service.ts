import {Injectable} from '@angular/core';
@Injectable()
export class UtilityService {
    
    //this service provides components/services/extras with functions that dont really belong anywhere
    constructor(){
        
    }

    compareNames(str1:String, str2:String){
        try{
            str1 = this.stripName(str1.replace(/\s/g, ''));
            str2 = this.stripName(str2.replace(/\s/g, ''));
            var str1L = str1.length;
            var str2L = str2.length;
            var equal = 0;
            if(str1L > str2L){
                for(var x = 0; x < str2L; x++){
                var charstr1 = str1.charAt(x);
                var charstr2 = str2.charAt(x);
                if(charstr1 == charstr2){
                    equal++;
                } 
                }

                var oneprocent = str1L / 100;
                var percentageEqual = equal / oneprocent;
                return percentageEqual;
            } else {
                for(var x = 0; x < str1L; x++){
                var charstr1 = str1.charAt(x);
                var charstr2 = str2.charAt(x);
                if(charstr1 == charstr2){
                    equal++;
                } 
                }

                var oneprocent = str2L / 100;
                var percentageEqual = equal / oneprocent;
                return percentageEqual;
            }
        } catch(e) {
            return 0;
        }
        
    }

    stripName(input : String){
        try{
            if(input.indexOf('.') > -1){
                input = input.split('.')[0];
            }
        } catch(e){

        }
        
        try{
            while(input.indexOf('[') > -1){ 
            if (input.indexOf('[') > -1)
            {
                if (input.indexOf(']') > -1)
                {
                    input = input.split('[')[0] + input.split(']')[1];
                } else {
                    input = input.split('[')[0] + input.split('[')[1]; 
                }
            }
            }
        } catch(e){

        }
        try{
            while(input.indexOf('(') > -1){
            if (input.indexOf('(') > -1)
            {
                if (input.indexOf(')') > -1)
                {
                    input = input.split('(')[0] + input.split(')')[1];
                } else {
                    input = input.split('(')[0] + input.split('(')[1];
                }
            }
            }
        } catch (e){}
       
        try{
            if (input.indexOf("E0") > -1)
            {
                try
                {

                    input = input.split("E0")[0] + input.split("E0")[1].substring(2);
                } catch(e)
                {
                    try
                    {

                        input = input.split("E0")[0] + input.split("E0")[1].substring(1);
                    }
                    catch(e)
                    {
                        input = input.split("E0")[0] + input.split("E0")[1];
                    }
                }
            }
        } catch (e){}
        try{
            if (input.indexOf("0") > -1)
            {
                try
                {
                    input = input.split("0")[0] + input.split("0")[1].substring(2);

                } catch(e)
                {
                    try
                    {
                        input = input.split("0")[0] + input.split("0")[1].substring(1);

                    }
                    catch(e)
                    {
                        input = input.split("0")[0] + input.split("0")[1];
                    }
                } 
            }
        } catch (e){}
        try{
            if (input.indexOf("1080") > -1)
            {
                input = input.split("1080")[0] + input.split("1080")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("720") > -1)
            {
                input = input.split("720")[0] + input.split("720")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("480") > -1)
            {
                input = input.split("480")[0] + input.split("480")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("3D") > -1)
            {
                input = input.split("3D")[0] + input.split("3D")[1];
            }
        } catch (e){}
        try{
            if (input.indexOf("BD") > -1)
            {
                input = input.split("BD")[0] + input.split("BD")[1];
            }
        } catch (e){}
        try{

        var numberInString = parseInt(input.replace( /^\D+/g, ''));
        while(numberInString > 9){
            numberInString = parseInt(input.replace( /^\D+/g, ''));
            if(numberInString > 9){
            if (input.indexOf(numberInString.toString()) > -1)
            {
                input = input.split(numberInString.toString())[0] + input.split(numberInString.toString())[1];
            }
            }
        }
        } catch (e){}
        try{
        

            input = input.replace(/[^\w\s]/gi, ' ').toLowerCase();
            input = input.split('_').join(' ').trim();
            input = input.replace(/ +(?= )/g,'');
        } catch (e){}
        return input;

    }


    getEpisodeNumber(input: string){
         try{
            if(input.indexOf('.') > -1){
                input = input.split('.')[0];
            }
        } catch(e){

        }
        
        try{
            while(input.indexOf('[') > -1){ 
            if (input.indexOf('[') > -1)
            {
                if (input.indexOf(']') > -1)
                {
                    input = input.split('[')[0] + input.split(']')[1];
                } else {
                    input = input.split('[')[0] + input.split('[')[1]; 
                }
            }
            }
        } catch(e){

        }
        try{
            while(input.indexOf('(') > -1){
            if (input.indexOf('(') > -1)
            {
                if (input.indexOf(')') > -1)
                {
                    input = input.split('(')[0] + input.split(')')[1];
                } else {
                    input = input.split('(')[0] + input.split('(')[1];
                }
            }
            }
        } catch (e){}

        
        try{
            if (input.indexOf("S") > -1)
            {
               
                var counter = 0;
               for(counter = 1; counter < 4; counter++){
                    var isnumber = input.split("S")[1].substr(0,counter);
                    if(Number(isnumber) === NaN){
                       break;
                    }
               }
               
               input = input.split("S")[0] + input.split("S")[1].substring(counter, input.split("S")[1].length);
              
            }
        } catch (e){}
        try{
            input = input.replace( /^\D+/g, '');
        }catch(e){}
        
        try{
            if (input.indexOf("1080") > -1)
            {
                input = input.split("1080")[0] + input.split("1080")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("720") > -1)
            {
                input = input.split("720")[0] + input.split("720")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("480") > -1)
            {
                input = input.split("480")[0] + input.split("480")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("x264") > -1)
            {
                input = input.split("x264")[0] + input.split("x264")[1].substring(1);
            }
        } catch (e){}
          try{
            if (input.indexOf("x265") > -1)
            {
                input = input.split("x265")[0] + input.split("x265")[1].substring(1);
            }
        } catch (e){}
        try{
            if (input.indexOf("h264") > -1)
            {
                input = input.split("h264")[0] + input.split("h264")[1].substring(1);
            }
        } catch (e){}
          try{
            if (input.indexOf("h265") > -1)
            {
                input = input.split("h265")[0] + input.split("h265")[1].substring(1);
            }
        } catch (e){}
        
        try{
            if (input.indexOf("Ep") > -1)
            {
                input = input.split("Ep")[0] + input.split("Ep")[1];
            }
        } catch (e){}
        try{
            if (input.indexOf("2nd") > -1)
            {
                input = input.split("2nd")[0] + input.split("2nd")[1];
            }
        } catch (e){}
        try{
            if (input.indexOf("3D") > -1)
            {
                input = input.split("3D")[0] + input.split("3D")[1];
            }
        } catch (e){}
        try{
            if (input.indexOf("BD") > -1)
            {
                input = input.split("BD")[0] + input.split("BD")[1];
            }
        } catch (e){}
        try{
            input = input.replace( /^\D+/g, '');
        }catch(e){}


        try{
            if (input.indexOf("v") > -1)
            {
                input = input.split("v")[0];
            }
        }catch(e){}
        /*
        try{
        

            input = input.replace(/[^\w\s]/gi, ' ').toLowerCase();
            input = input.split('_').join(' ').trim();
            input = input.replace(/ +(?= )/g,'');
        } catch (e){} */
        return input.toLowerCase();;
    }

    generateId(str1 : string, str2 : string){
        var text = "";
        var possible = this.stripName(str1 + str2);

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}