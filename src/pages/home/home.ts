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

    constructor(public navCtrl: NavController, private speechService: SpeechService) {

    }

    launchSpeechRecognition() {
        this.speechService.startSpeechRecognition();
    }

}
