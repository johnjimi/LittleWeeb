import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Subject, BehaviorSubject, Observable} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import {NiblService} from './nibl.service'
import {ShareService} from './share.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class KitsuService {

    public currentAnimeData: any;
    public animeDataEvents : Subject<any> = new BehaviorSubject<any>(null);
    private episodesRetreived : any;


    constructor(private http: Http, private niblService :NiblService, private shareService : ShareService){
      
        console.log("Launching Kitsu API");
        this.currentAnimeData = null;
    }

     //the only thing this service does (for now) is searching 
    async searchAnime(search : string, amount: number, status?:string){  
        if(status !== undefined || status != null){
            console.log(status);
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[text]=' + search + '&page[limit]=' + amount.toString() + '&filter[status]=' + status)).toPromise();  
            return response.json();   
        } else {
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[text]=' + search + '&page[limit]=' + amount.toString())).toPromise();     
            return response.json();  
        }       
        
      
             
    }

    async getAnimeInfo(id : any,  offset: string, query: string, type?: string){
        
        this.episodesRetreived = undefined;
        if(type === undefined || type == null){
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + "?page[limit]=20&page[offset]=" + offset + query)).toPromise();        
            var json = response.json();
            return json;
        } else  {
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + '/' + type + "?page[limit]=20&page[offset]=" + offset + query)).toPromise();
            var json = response.json();
            return json;  
        }
    }

    async getEpisodeTitle(id: any, episode: number){
        if(episode > 0){

            if(this.episodesRetreived === undefined){
                console.log("kitsu: no episodes retreived yet");
                let offset = 0;
                if(((episode - 1) % 20) == 0){
                    offset = (episode / 20) * 20 - 1;
                }
                const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + '/episodes?sort=number&fields[episodes]=canonicalTitle&page[limit]=20&page[offset]=' + offset)).toPromise();
                this.episodesRetreived = {id: id, offset : offset, response: response.json()};
                console.log( this.episodesRetreived );

                try{
                        
                    return this.episodesRetreived.response.data[episode - offset - 1].attributes.canonicalTitle;
                } catch (e){
                    
                    return false;
                }
            }  else {
                 console.log("i shouldnt come here");
                if(this.episodesRetreived.id == id){
                     if((episode - this.episodesRetreived.offset) >= 20){
                        let offset = 0;
                        if(((episode - 1) % 20) == 0){
                            offset = (episode / 20) * 20 - 1;
                        }
                        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + '/episodes?sort=number&fields[episodes]=canonicalTitle&page[limit]=20&page[offset]=' + offset)).toPromise();
                        this.episodesRetreived = {id: id, offset : offset, response: response.json()};
                        console.log("stuff");
                        console.log( this.episodesRetreived );
                        console.log(episode - offset - 1);
                         try{
                        
                            return this.episodesRetreived.response.data[episode - offset - 1].attributes.canonicalTitle;
                        } catch (e){
                            
                            return false;
                        }
                    } else {
                        console.log( this.episodesRetreived );
                         try{
                            return this.episodesRetreived.response.data[episode - this.episodesRetreived.offset - 1].attributes.canonicalTitle;
                        } catch (e){
                            
                            return false;
                        }
                   
                    }
                } else {
                    console.log("kitsu: no episodes retreived yet");
                    let offset = 0;
                    if(((episode - 1) % 20) == 0){
                        offset = (episode / 20) * 20 - 1;
                    }
                    const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id + '/episodes?sort=number&fields[episodes]=canonicalTitle&page[limit]=20&page[offset]=' + offset)).toPromise();
                    this.episodesRetreived = {id: id, offset : offset, response: response.json()};
                    console.log( this.episodesRetreived );

                    try{
                        
                        return this.episodesRetreived.response.data[episode - offset - 1].attributes.canonicalTitle;
                    } catch (e){
                        
                        return false;
                    }

                }

               
            }
           
        } else {
            return false;
        }
       
    }

    async getAllInfo(id: any){
        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id)).toPromise();        
        var globalInfo = response.json();
        
        var newObj = {id: id, animeInfo : globalInfo.data.attributes, relations : {}};
        const responseRelationship = await this.http.get( encodeURI(globalInfo.data.relationships.genres.links.related)).toPromise();  
        var relationInfo = responseRelationship.json();  
        newObj.relations["genres"] = relationInfo.data;
        return newObj;
    }

    async getCurrentlyAiringPerPage(limit : string, page: string){
        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=' + limit + '&page[offset]=' + page)).toPromise();
        return response.json();       
    }

   getAllCurrentlyAiring(){
        let observable=Observable.create(observer => {
           
            this.niblService.getLatestEpisodes(692).subscribe(async(result)=>{
                var seconds = new Date().getTime() / 1000;
                var objArray = [];
                var parsedAnimes = [];
                for(let animename of result){
                    
                    if(animename.length > 5){
                        var anime = await this.searchAnime(animename, 1, "current");
                        anime = anime.data[0];
                        if(parsedAnimes.indexOf(anime.id) == -1){
                            if(anime.attributes.status == "current" || anime.attributes.showType == "movie"){
                                objArray.push(anime);                        
                            }
                            parsedAnimes.push(anime.id);    

                        } else {
                            break;
                        }
                    
                    
                    }
                }     
                console.log("END:");
                seconds = (new Date().getTime() / 1000) - seconds;
                console.log(seconds); 
                observer.next(objArray);
                observer.complete();
            });
        });
        return observable;
        
    }  
}