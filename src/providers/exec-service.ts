import {Injectable} from '@angular/core';
import {CommonService} from './common-service';
import {FreeboxService} from './freebox-service';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ExecService {

    private subscriptionTimer:ISubscription;

    constructor(private commonService: CommonService, private freeboxService: FreeboxService) {

    }

    checkCoucou(parameters) {
        if (parameters[0]==='moi') {
            this.commonService.textToSpeech('Qui ça moi ?');
        } else {
            this.commonService.textToSpeech('Coucou ' + parameters[0] + ' !');
        }
    }

    checkLight(parameters, conjonction) {
        let message: any = 'La lumière '+conjonction+' ' + parameters[1] + ' est ';
        if (parameters[0]==='allume') {
            this.commonService.textToSpeech(message + 'allumée !');
        } else {
            this.commonService.textToSpeech(message + 'éteinte !');
        }
    }

    connectFreebox() {
        this.commonService.getGranted().then(granted => {
            if (granted) {
                this.commonService.textToSpeech('Je suis connecté !');
            } else {
                const message: any = 'Je dois m\'authentifier sur la Freebox ! ';
                this.authFreebox(message);
            }
        });
    }

    authFreebox(message) {
        this.freeboxService.auth().then(auth => {
            if (auth) {
                this.commonService.textToSpeech(message + 'Pour me donner l\'accès,  tu dois appuyer sur la flêche droite de l\'écran de la Freebox server !');
                this.subscriptionTimer = Observable.interval(2500).subscribe(x => {
                    this.checkStatusFreebox();
                });
            } else {
                this.commonService.textToSpeech(message + 'Mais je ne parviens pas à m\'y connecté, je suis désolé.');
            }
        });
    }

    checkStatusFreebox () {
        this.freeboxService.getStatus().then(status => {
            if (status=='granted') {
                this.commonService.textToSpeech('C\'est bon ! Je suis connecté !');
                this.subscriptionTimer.unsubscribe ();
            } else if (status!='pending') {
                this.subscriptionTimer.unsubscribe ();
                this.commonService.textToSpeech('Une erreur s\'est produite, je te conseille de réessayer !');
            }
        });
    }

    launchMusicFreebox() {
        this.commonService.getGranted().then(granted => {
            if (granted) {
                this.commonService.textToSpeech('Attends quelques secondes s\'il te plait.');
                this.freeboxService.launch('startMedia').then(launch => {
                    if (!launch) {
                        this.commonService.textToSpeech('Je ne parviens pas à lancer la musique !');
                    }
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                this.authFreebox(message);
            }
        });
    }

    stopMusicFreebox(parameters) {
        this.commonService.getGranted().then(granted => {
            if (granted) {
                this.commonService.textToSpeech('ok');
                this.freeboxService.launch('stopMedia').then(stop => {
                    if (!stop) {
                        this.commonService.textToSpeech('Je ne parviens pas à arrêter la '+parameters[0]+' !');
                    }
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                this.authFreebox(message);
            }
        });
    }

    showServerListFreebox() {
        this.commonService.getGranted().then(granted => {
            if (granted) {
                this.commonService.textToSpeech('Attends quelques secondes s\'il te plait.');
                this.freeboxService.launch('getServerMediaList').then(server => {
                    if (!server) {
                        this.commonService.textToSpeech('Je ne parviens pas à afficher les serveurs !');
                    } else {
                        this.commonService.textToSpeech('Et voilà !');
                    }
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                this.authFreebox(message);
            }
        });
    }

    showDirectoryInfoFreebox(parameters) {
        this.commonService.getGranted().then(granted => {
            if (granted) {
                this.commonService.textToSpeech('Attends quelques secondes s\'il te plait.');
                const param: any = [];
                if (parameters[0] == 'musique') {
                    param['path'] = '/Disque dur/Musiques/compil_test';
                }
                this.freeboxService.launch('getDirectoryInfo', param).then(directoryInfo => {
                    if (!directoryInfo) {
                        this.commonService.textToSpeech('Je ne parviens pas à afficher les informations du répertoire !');
                    } else {
                        this.commonService.textToSpeech('Et voilà !');
                    }
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                this.authFreebox(message);
            }
        });
    }

}

