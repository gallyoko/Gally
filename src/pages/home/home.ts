import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {CommonService} from '../../providers/common-service';
import {ExecService} from '../../providers/exec-service';
import {SpeechService} from '../../providers/speech-service';
import {FreeboxService} from '../../providers/freebox-service';
import {LightService} from '../../providers/light-service';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    providers: [SpeechService, CommonService, ExecService, FreeboxService, LightService]
})
export class HomePage {
    private permissionMicro: boolean = false;
    private permissions: any = [];
    private requireAutorisation: boolean = false;

    constructor(public navCtrl: NavController, private speechService: SpeechService,
                private commonService: CommonService) {
        this.permissions = [
            {
                'name': 'le micro',
                'service': 'RECORD_AUDIO',
                'actif': false
            },
            {
                'name': 'la géolocalisation',
                'service': 'ACCESS_COARSE_LOCATION',
                'actif': false
            }
        ];
        this.checkPermissions();
    }

    checkPermissions() {
        this.commonService.loadingShow('Veuillez patienter pendant le contrôle des autorisations...');
        for (let i = 0; i < this.permissions.length; i++) {
            this.commonService.checkPermission(this.permissions[i].service).then(checkPermission => {
                if(checkPermission) {
                    this.permissions[i].actif = true;
                    if (this.permissions[i].service === 'RECORD_AUDIO') {
                        this.permissionMicro = true;
                    }
                } else {
                    this.requireAutorisation = true;
                    this.permissions[i].actif = false;
                }
                if (i === (this.permissions.length - 1)) {
                    this.commonService.loadingHide();
                }
            });
        }
    }

    requestPermission(permission) {
        this.commonService.requestPermission(permission.service).then(requestPermission => {
            if(requestPermission) {
                if (permission.service === 'RECORD_AUDIO') {
                    this.permissionMicro = true;
                }
                this.permissions = this.permissions.filter((permissionCheck) =>
                    permissionCheck.service !== permission.service
                );
                if (this.permissions.length == 0) {
                    this.requireAutorisation = false;
                }
            } else {
                if (permission.service === 'RECORD_AUDIO') {
                    this.commonService.textToSpeech('Tu dois accepter sinon tu ne pourras pas du tout m\'utiliser !');
                } else {
                    this.commonService.textToSpeech('Tu dois accepter sinon tu ne pourras pas utiliser ' + permission.name + '!');
                }
            }
        });
    }

    launchSpeechRecognition() {
        if (this.permissionMicro) {
            this.speechService.startSpeechRecognition();
        } else {
            this.commonService.textToSpeech('Tu dois m\'autoriser à utiliser le micro !');
        }
    }

}
