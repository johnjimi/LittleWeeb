import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Subject, BehaviorSubject, Observable} from 'rxjs/Rx';
import {BackEndService} from './backend.service';
import {NiblService} from './nibl.service'
import {ShareService} from './share.service'
import {UtilityService} from './utility.service'
import 'rxjs/add/observable/of'; //proper way to import the 'of' operator
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { forkJoin } from "rxjs/observable/forkJoin";
import { concat } from "rxjs/observable/concat"

/**
 * (SERVICE) KitsuService
 * Service to communicatie with the API from http://kitsu.io
 * 
 * @export
 * @class KitsuService
 */
@Injectable()
export class KitsuService {

    public currentAnimeData: any;
    public animeDataEvents : Subject<any> = new BehaviorSubject<any>(null);

    private episodesRetreived : any;
    private enableDebugging : boolean = true;

    /**
     * Creates an instance of KitsuService.
     * @param {Http} http (used for http requests)
     * @param {NiblService} niblService (used for communicating with the api from nibl.co.uk)
     * @param {ShareService} shareService (used to send and receive information to/form other Components & Services)
     * @param {UtilityService} utilityService (contains methods not specific to any Component)
     * @memberof KitsuService
     */
    constructor(private http: Http, private niblService :NiblService, private shareService : ShareService, private utilityService : UtilityService){      
        this.consoleWrite("Launching Kitsu API");
        this.currentAnimeData = null;
    }

    /**
     * To search anime using the api from kitsu.
     * 
     * @param {string} search (search query)
     * @param {number} amount (amount of results (max) (range: 1-20))
     * @param {string} [status] (to get only anime with a specific status (airing for example))
     * @returns {object} (json object with response)
     * @memberof KitsuService
     */
    async searchAnime(search : string, amount: number, status?:string){  
        if(status !== undefined || status != null){
            this.consoleWrite(status);
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[text]=' + search + '&page[limit]=' + amount.toString() + '&filter[status]=' + status)).toPromise();  
            return response.json();   
        } else {
            const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[text]=' + search + '&page[limit]=' + amount.toString())).toPromise();     
            return response.json();  
        }      
    }
        
    /**
     * To get specific anime information using the api from kitsu.
     * 
     * @param {*} id (id of anime)
     * @param {string} query (custom query (check: https://kitsu.docs.apiary.io/#))
     * @param {string} offset (used for specifiying starting index for mutliple results)
     * @param {string} [type] (for specific type (tv, movie etc.))
     * @returns {object} (json object with response)
     * @memberof KitsuService
     */
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
    
    /**
     * Get all anime information about anime using id of anime using api from kitsu.
     * 
     * @param {*} id (id of anime)
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
    async getAllInfo(id: any){
        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime/' + id)).toPromise();        
        var globalInfo = response.json();
        
        var newObj = {id: id, animeInfo : globalInfo.data.attributes, relations : {}};
        const responseRelationship = await this.http.get( encodeURI(globalInfo.data.relationships.genres.links.related)).toPromise();  
        var relationInfo = responseRelationship.json();  
        newObj.relations["genres"] = relationInfo.data;
        return newObj;
    }

    /**
     * Gets currently airing per page (max result = 20 so with > 20 airing animes you need to go through multiple pages)
     * 
     * @param {string} limit (max result limit)
     * @param {string} page (page to request)
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
    async getCurrentlyAiringPerPage(limit : string, page: string){
        const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=' + limit + '&page[offset]=' + page)).toPromise();
        return response.json();       
    }

    /**
     * Get all currently airing anime on kitsu
     * 
     * @returns {object} (json object with response) 
     * @memberof KitsuService
     */
    getAllCurrentlyAiring(){
        let observable=Observable.create(observer => {         

            this.niblService.getLatestEpisodes(692).subscribe(async(result)=>{
                this.consoleWrite("RESULT:");
                this.consoleWrite(result);
                var seconds = new Date().getTime() / 1000;
                var objArray = [];
                var parsedAnimes = [];
                var parsedAnimeTitles= [];
                var getRequests = [];
                this.consoleWrite(result);
                const response = await this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current')).toPromise();
                let results = response.json();

                let amountofanimeairing = results.meta.count;
                let amountofrequests = amountofanimeairing / 20 + 1;
                let reqcount = 0;
                let reqoffset = 0;
                getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=20&page[offset]=' + (reqcount * 20))).map((res)=> res.json()));
                for(reqcount = 1 ; reqcount < amountofrequests; reqcount++){
                    getRequests.push(this.http.get( encodeURI('https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=20&page[offset]=' + (reqcount * 20 + 1))).map((res)=> res.json()));
                }


                
                let i = 0;
                for(i = result.length  - amountofanimeairing; i < result.length; i++){
                    let strippedepisodename = this.utilityService.stripName(result[i]);
                    parsedAnimeTitles.push(strippedepisodename);
                }
                
                console.log(parsedAnimeTitles);
                this.consoleWrite(getRequests);
                forkJoin(getRequests).subscribe((next : any) =>{
                    console.log("KITSU RESULT:");
                    console.log(next);
                    
                    for(let animetitle of parsedAnimeTitles){
                        for(let result of next){
                            for(let data of result.data){
                                let strippedslug = this.utilityService.stripName(data.attributes.slug);
                               // console.log(strippedslug);
                            //   console.log("comparing:");
                              //  console.log(animetitle);
                              //  console.log(strippedslug);
                                if(this.utilityService.compareNames(animetitle, strippedslug) > 40 && parsedAnimes.indexOf(strippedslug) == -1){
                                    parsedAnimes.push(strippedslug);
                                    objArray.push(data);
                                    break;
                                }
                            }
                        }
                    }

                
                    
                    this.consoleWrite("END:");
                    seconds = (new Date().getTime() / 1000) - seconds;
                    this.consoleWrite(seconds); 
                    observer.next(objArray);
                    observer.complete();

                });
            });
        });
        return observable;
        
    } 
    
    /**
     * Custom console.log function so that it can be enabled/disabled if there is no need for debugging
     * 
     * @param {*} log (gets any type of variable and shows it if enableDebug is true) 
     * @memberof KitsuService
     */
    async consoleWrite(log: any){
        if(this.enableDebugging){
            console.log(log);
        }
    }
}