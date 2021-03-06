import {Injectable} from '@angular/core';
import {CommonService} from './common-service';
import {ConfigService} from './config-service';
import {FreeboxService} from './freebox-service';
import {SpeechService} from './speech-service';
import {MediaModel} from '../models/media.model';
import {ChannelModel} from '../models/channel.model';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class ExecService {

    private subscriptionTimer: ISubscription;
    private medias: any = [];
    private actionList: any = [];
    private waitingResponse: boolean = false;
    private waitingFunction: string;
    private callReturnFunction: any = [];

    constructor(private commonService: CommonService, private freeboxService: FreeboxService,
                private configService: ConfigService) {
        this.callReturnFunction = [
            {
                'request': 'howAreYou',
                'callTrue': 'feelingGood',
                'callFalse': 'feelingBad',
            }
        ];
    }

    checkNextAction() {
        if (this.actionList.length > 0) {
            const action: string = this.actionList[0].action;
            const parameters: any = this.actionList[0].parameters;
            this.actionList = this.actionList.slice(1);
            this[action](parameters);
        }
    }

    yes() {
        if (this.waitingResponse) {
            this.waitingResponse = false;
            const functionReturn: any = this.callReturnFunction.filter((functionToCall) =>
                functionToCall.request == this.waitingFunction
            );
            this[functionReturn[0].callTrue]();
        } else {
            this.commonService.textToSpeech('Oui à quoi ?');
        }
    }

    no() {
        if (this.waitingResponse) {
            this.waitingResponse = false;
            const functionReturn: any = this.callReturnFunction.filter((functionToCall) =>
                functionToCall.request == this.waitingFunction
            );
            this[functionReturn[0].callFalse]();
        } else {
            this.commonService.textToSpeech('Non à quoi ?');
        }
    }

    feelingGood() {
        this.commonService.textToSpeech('C\'est cool !');
    }

    feelingBad() {
        this.commonService.textToSpeech('Ah merde !');
    }

    checkCoucou(speechService: SpeechService, parameters) {
        if (parameters[0] === 'moi') {
            this.commonService.textToSpeech('Qui ça moi ?');
            this.waitingResponse = true;
            speechService.startSpeechRecognition();
        } else {
            this.commonService.textToSpeech('Coucou ' + parameters[0] + ' !');
        }
    }

    analizeName(parameters) {
        if (this.waitingResponse) {
            this.waitingResponse = false;
            if (parameters[0] === 'ton maître') {
                this.commonService.textToSpeech('Putain ! comment tu te la joues !');
            } else {
                this.commonService.textToSpeech('Salut ' + parameters[0] + ' !');
            }
        } else {
            this.commonService.textToSpeech('Et alors ?');
        }
    }

    howAreYou(speechService: SpeechService) {
        this.commonService.textToSpeech('ça va et toi ? oui ou non ?');
        this.waitingFunction = 'howAreYou';
        this.waitingResponse = true;
        speechService.startSpeechRecognition();
    }

    checkLight(parameters, conjonction) {
        let message: any = 'La lumière ' + conjonction + ' ' + parameters[1] + ' est ';
        if (parameters[0] === 'allume') {
            this.commonService.textToSpeech(message + 'allumée !');
        } else {
            this.commonService.textToSpeech(message + 'éteinte !');
        }
    }

    connectFreebox() {
        this.commonService.getElement('granted').then(granted => {
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

    checkStatusFreebox() {
        this.freeboxService.getStatus().then(status => {
            if (status == 'granted') {
                this.commonService.textToSpeech('C\'est bon ! Je suis connecté !');
                this.subscriptionTimer.unsubscribe();
            } else if (status != 'pending') {
                this.subscriptionTimer.unsubscribe();
                this.commonService.textToSpeech('Une erreur s\'est produite, je te conseille de réessayer !');
            }
        });
    }

    launchMediaFreebox(parameters) {
        this.commonService.getElement('granted').then(granted => {
            if (granted) {
                let getterValue: any = '';
                if (parameters[0] === 'musique') {
                    getterValue = 'musics';
                } else if (parameters[0] === 'vidéo') {
                    getterValue = 'videos';
                }
                this.commonService.getElement(getterValue).then(getMedias => {
                    if (getMedias) {
                        const medias: any = getMedias;
                        if (medias.length > 0) {
                            const media: MediaModel = medias[Math.floor(Math.random() * medias.length)];
                            this.getShareLinkFreebox(media).then(shareLink => {
                                if (shareLink) {
                                    const link: any = shareLink.toString() + '/' + media.title.replace(' ', '%20');
                                    const param: any = [];
                                    param['media'] = link.replace(this.configService.urlExternFreebox, this.configService.urlLocalFreebox);
                                    this.freeboxService.launch('startMedia', param).then(launch => {
                                        if (!launch) {
                                            this.commonService.textToSpeech('Je ne parviens pas à lancer la ' + parameters[0] + ' !');
                                        } else {
                                            this.commonService.textToSpeech('C\'est parti !');
                                        }
                                    });
                                } else {
                                    this.commonService.textToSpeech('Je ne parviens pas à lancer la ' + parameters[0] + ' !');
                                }
                            });
                        } else {
                            this.commonService.textToSpeech('Je dois d\'abord scanner la Freebox.');
                            this.actionList.push({
                                'action': 'launchMediaFreebox',
                                'parameters': parameters
                            });
                            this.scanDirectoryFreebox(parameters);
                        }
                    } else {
                        this.commonService.textToSpeech('Je dois d\'abord scanner la Freebox.');
                        this.actionList.push({
                            'action': 'launchMediaFreebox',
                            'parameters': parameters
                        });
                        this.scanDirectoryFreebox(parameters);
                    }
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande.';
                this.authFreebox(message);
            }
        });
    }

    deleteShareLinkFreebox() {
        return new Promise(resolve => {
            this.freeboxService.launch('getShareLinks').then(getShareLinks => {
                const shareLinks: any = getShareLinks;
                if (shareLinks.success) {
                    if (shareLinks.result) {
                        for (let i = 0; i < shareLinks.result.length; i++) {
                            const param: any = [];
                            param['token'] = shareLinks.result[i].token;
                            this.freeboxService.launch('deleteShareLink', param).then(deleteShareLink => {
                                if (i === (shareLinks.result.length - 1)) {
                                    resolve(true);
                                }
                            });
                        }
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    getShareLinkFreebox(media: MediaModel) {
        return new Promise(resolve => {
            this.freeboxService.launch('getShareLinks').then(getShareLinks => {
                const shareLinks: any = getShareLinks;
                if (shareLinks.success) {
                    let linkShares: any = [];
                    if (shareLinks.result) {
                        linkShares = shareLinks.result.filter((shareLink) =>
                            shareLink.path == btoa(media.path) || shareLink.path == btoa(media.path + '/')
                        );
                    }
                    if (linkShares.length > 0) {
                        resolve(linkShares[0].fullurl);
                    } else {
                        const param: any = [];
                        param['path'] = media.path;
                        this.freeboxService.launch('setShareLink', param).then(setShareLink => {
                            const shareLink: any = setShareLink;
                            if (shareLink.success) {
                                resolve(shareLink.result.fullurl);
                            } else {
                                resolve(false);
                            }
                        });
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    stopMediaFreebox(parameters) {
        this.commonService.getElement('granted').then(granted => {
            if (granted) {
                this.commonService.textToSpeech('ok');
                this.freeboxService.launch('stopMedia').then(stop => {
                    if (!stop) {
                        this.commonService.textToSpeech('Je ne parviens pas à arrêter la ' + parameters[0] + ' !');
                    }
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                this.authFreebox(message);
            }
        });
    }

    showServerListFreebox() {
        this.commonService.getElement('granted').then(granted => {
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

    scanDirectoryFreebox(parameters) {
        this.commonService.getElement('granted').then(granted => {
            if (granted) {
                let path: any = '';
                if (parameters[0] == 'musique') {
                    path = this.configService.pathMusic;
                } else if (parameters[0] == 'vidéo') {
                    path = this.configService.pathVideo;
                }
                this.medias = [];
                this.scandirectory(path, parameters[0]).then(mediaScan => {
                    if (mediaScan) {
                        const newMedias: any = this.medias;
                        Array.prototype.push.apply(newMedias, mediaScan);
                        this.medias = newMedias;
                        if (parameters[0] === 'musique') {
                            this.commonService.setElement('musics', this.medias);
                        } else if (parameters[0] === 'vidéo') {
                            this.commonService.setElement('videos', this.medias);
                        }
                    }
                });
                this.subscriptionTimer = Observable.interval(4000).subscribe(x => {
                    this.checkMedias(parameters[0]);
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                this.authFreebox(message);
            }
        });
    }

    checkMedias(type) {
        if (type === 'musique') {
            this.commonService.getElement('musics').then(getMusics => {
                const musics: any = getMusics;
                if (musics.length == this.medias.length) {
                    this.subscriptionTimer.unsubscribe();
                    this.commonService.textToSpeech('Et voilà ! J\'ai recensé ' + this.medias.length + ' titres.');
                    this.checkNextAction();
                }
            });
        } else if (type === 'vidéo') {
            this.commonService.getElement('videos').then(getVideos => {
                const videos: any = getVideos;
                if (videos.length == this.medias.length) {
                    this.subscriptionTimer.unsubscribe();
                    this.commonService.textToSpeech('Et voilà ! J\'ai recensé ' + this.medias.length + ' titres.');
                    this.checkNextAction();
                }
            });
        }
    }

    scandirectory(path, type) {
        return new Promise(resolve => {
            const param: any = [];
            param['path'] = path;
            let extensions: any = [];
            if (type === 'musique') {
                extensions = this.configService.ExtensionMusic;
            } else if (type === 'vidéo') {
                extensions = this.configService.ExtensionVideo;
            }
            this.freeboxService.launch('getDirectoryInfo', param).then(directoryInfo => {
                const directory: any = directoryInfo;
                if (directory.success) {
                    const medias: any = [];
                    for (let i = 0; i < directory.result.length; i++) {
                        if (directory.result[i].type === 'dir') {
                            if (directory.result[i].name !== '.' && directory.result[i].name !== '..') {
                                const newPath: any = path + '/' + directory.result[i].name;
                                this.scandirectory(newPath, type).then(mediaScan => {
                                    if (mediaScan) {
                                        const newMedias: any = this.medias;
                                        Array.prototype.push.apply(newMedias, mediaScan);
                                        this.medias = newMedias;
                                        if (type === 'musique') {
                                            this.commonService.setElement('musics', this.medias);
                                        } else if (type === 'vidéo') {
                                            this.commonService.setElement('videos', this.medias);
                                        }
                                    }
                                });
                            }
                        } else {
                            const extension: any = directory.result[i].name.split('.').reverse()[0];
                            if (extensions.indexOf(extension) > -1) {
                                let media: MediaModel;
                                if (type === 'musique') {
                                    media = new MediaModel(directory.result[i].name,
                                        path, 'music', extension);
                                } else if (type === 'vidéo') {
                                    media = new MediaModel(directory.result[i].name,
                                        path, 'video', extension);
                                }
                                medias.push(media);
                            }
                        }
                        if (i === (directory.result.length - 1)) {
                            resolve(medias);
                        }
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    launchChannelFreebox(parameters) {
        this.commonService.getElement('granted').then(granted => {
            if (granted) {
                this.getChannelsFreebox().then(channelsFreebox => {
                    const channels: any = channelsFreebox;
                    console.log('channels', channels);
                    const selectChannels: any = channels.filter((channel) =>
                        channel.name.toLowerCase() == parameters[0].toLowerCase()
                    );
                    console.log('selectChannels', selectChannels);
                    this.getChannelListFreebox().then(channelListFreebox => {
                        const channelList: any = channelListFreebox;
                        const selectChannel: any = channelList.filter((channel) =>
                            channel.number == selectChannels[0].number
                        );
                        const selectChannelQuality: any = selectChannel[0].streams.filter((channelInfo) =>
                            channelInfo.quality.toLowerCase() == selectChannels[0].quality.toLowerCase()
                        );
                        const param: any = [];
                        param['media'] = selectChannelQuality[0].hls;
                        this.freeboxService.launch('startMedia', param).then(launch => {
                            if (!launch) {
                                this.commonService.textToSpeech('Je ne parviens pas à lancer la ' + parameters[0] + ' !');
                            } else {
                                this.commonService.textToSpeech(parameters[0] + ' lancé.');
                            }
                        });
                    });
                });
            } else {
                const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande.';
                this.authFreebox(message);
            }
        });
    }

    getChannelsFreebox() {
        return new Promise(resolve => {
            const channels: any = [];
            let blob: any = null;
            let request: XMLHttpRequest = new XMLHttpRequest();
            request.responseType = "blob";
            request.onload = function () {
                blob = request.response;
                let reader = new FileReader();
                reader.readAsText(blob);
                reader.onload = () => {
                    const playlistChannels: any = reader.result.split("\n");
                    let channel: any = [];
                    for (let i = 1; i < playlistChannels.length; i++) {
                        if (i % 2 == 0) {
                            let channelModel = new ChannelModel(channel['number'], channel['name'],
                                channel['quality'], playlistChannels[i]);
                            channels.push(channelModel);
                            channel = [];
                        } else {
                            if (playlistChannels[i]) {
                                let infoChannelTemp1: any = playlistChannels[i].split(",");
                                if (infoChannelTemp1.length > 1) {
                                    let infoChannelTemp2: any = infoChannelTemp1[1].split(" - ");
                                    if (infoChannelTemp2.length > 1) {
                                        channel['number'] = parseInt(infoChannelTemp2[0].trim());
                                        let infoChannelTemp3: any = infoChannelTemp2[1].split(" (");
                                        channel['name'] = infoChannelTemp3[0].trim();
                                        if (infoChannelTemp3[1]) {
                                            channel['quality'] = infoChannelTemp3[1].replace(')', '').trim();
                                        } else {
                                            channel['quality'] = '';
                                        }
                                    }
                                }
                            }
                        }
                        if (i === (playlistChannels.length - 1)) {
                            resolve(channels);
                        }
                    }
                }
            };
            request.open("GET", this.configService.urlPlaylistFreebox);
            request.send();
        });
    }

    getChannelListFreebox() {
        return new Promise(resolve => {
            this.commonService.getElement('granted').then(granted => {
                if (granted) {
                    this.freeboxService.launch('getChannels').then(channelList => {
                        if (channelList['success']) {
                            resolve(channelList['result']);
                        } else {
                            resolve(channelList);
                        }
                    });
                } else {
                    const message: any = 'Je dois d\'abord m\'authentifier sur la Freebox ! Ensuite je pourrais lancer ta commande. ';
                    this.authFreebox(message);
                    resolve([]);
                }
            });
        });
    }

    getCurrentPosition() {
        this.commonService.getCurrentPosition().then(position => {
            if (!position) {
                this.commonService.textToSpeech('Désolé mais je ne parviens pas à te localiser !');
            } else {
                this.commonService.textToSpeech('Ta position latitude est ' + position['coords'].latitude +
                    ' et longitude ' + position['coords'].longitude);
            }
        });
    }

}

