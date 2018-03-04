import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {CommonService} from '../../providers/common-service';
import {ExecService} from '../../providers/exec-service';
import {SpeechService} from '../../providers/speech-service';
import {FreeboxService} from '../../providers/freebox-service';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    providers: [SpeechService, CommonService, ExecService, FreeboxService]
})
export class HomePage {
    private permissionMicro: boolean = false;
    private permissions: any = [];

    constructor(public navCtrl: NavController, private speechService: SpeechService,
                private commonService: CommonService) {
        this.permissions = [
            {
                'name': 'le micro',
                'service': 'RECORD_AUDIO',
            },
            {
                'name': 'la géolocalisation',
                'service': 'ACCESS_COARSE_LOCATION',
            }
        ];
        this.checkPermissions();
    }

    checkPermissions() {
        const requestPermission: any = [];
        for (let i = 0; i < this.permissions.length; i++) {
            this.commonService.checkPermission(this.permissions[i].service).then(checkPermission => {
                if(checkPermission) {
                    this.permissionMicro = true;
                } else {
                    requestPermission.push(this.permissions[i]);
                }
                if (i === (this.permissions.length - 1)) {
                    this.requestPermission(requestPermission);
                }
            });
        }

    }

    requestPermission(requestPermission) {
        let permissionDeviceTxt: string = '';
        let permissionService: any = [];
        for (let i = 0; i < requestPermission.length; i++) {
            if (i > 0) {
                permissionDeviceTxt += ' et ';
            }
            permissionDeviceTxt += requestPermission[i].name;
            permissionService.push(requestPermission[i].service)
        }
        this.commonService.textToSpeech('Tu dois m\'autoriser à utiliser ' + permissionDeviceTxt + ' !');
        this.commonService.requestPermission(permissionService).then(requestPermission => {
            if(requestPermission) {
                this.permissionMicro = true;
            } else {
                this.commonService.textToSpeech('Tu dois accepter sinon tu ne pourras pas m\'utiliser !');
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
