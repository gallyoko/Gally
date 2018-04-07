import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CommonService} from './common-service';
import {ConfigService} from './config-service';
import 'rxjs/add/operator/map';

@Injectable()
export class RecalboxService {
    private routeApi: any;
    private routeStopGame: any;

    constructor(private http: HttpClient, public commonService: CommonService,
                private configService: ConfigService) {
        this.routeApi = this.configService.urlApiPerso;
        this.routeStopGame = this.routeApi + 'recalbox/game/stop';
    }

    stopGame() {
        return new Promise(resolve => {
            this.http.get(this.routeStopGame)
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
}
