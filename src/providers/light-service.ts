import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CommonService} from './common-service';
import {ConfigService} from './config-service';
import 'rxjs/add/operator/map';

@Injectable()
export class LightService {
    private routeApi: any;
    private routeList: any;
    private routePut: any;

    constructor(private http: HttpClient, public commonService: CommonService,
                private configService: ConfigService) {
        this.routeApi = this.configService.urlApiPerso;
        this.routeList = this.routeApi + 'lights';
        this.routePut = this.routeApi + 'light/put/';
    }

    list() {
        return new Promise(resolve => {
            this.http.get(this.routeList)
                .subscribe(
                    response => {
                        resolve(response);
                    },
                    err => {
                        resolve(false);
                    }
                );
        });
    }

    put(action, id) {
        return new Promise(resolve => {
            this.http.get(this.routePut + action + '/' + id)
                .subscribe(
                    response => {
                        resolve(response['success']);
                    },
                    err => {
                        resolve(false);
                    }
                );
        });
    }

}
