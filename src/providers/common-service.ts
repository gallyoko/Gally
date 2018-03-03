import {Injectable} from '@angular/core';
import {App, NavController, Platform, LoadingController, ToastController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {SpinnerDialog} from '@ionic-native/spinner-dialog';
import {Toast} from '@ionic-native/toast';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';
import {MediaModel} from "../models/media.model";

@Injectable()
export class CommonService {

    private loader: any = null;

    constructor(private app: App, private navCtrl: NavController, private platform: Platform,
                private loadingCtrl: LoadingController, private toastCtrl: ToastController,
                private spinnerDialog: SpinnerDialog, private toast: Toast, private tts: TextToSpeech,
                private nativeStorage: NativeStorage, private storage: Storage) {

    }

    loadingShow(message) {
        if (this.platform.is('cordova')) {
            this.spinnerDialog.show(null, message);
        } else {
            let loading = this.loadingCtrl.create({
                content: message
            });
            this.loader = loading;
            this.loader.present();
        }
    }

    loadingHide() {
        if (this.platform.is('cordova')) {
            this.spinnerDialog.hide();
        } else {
            this.loader.dismiss();
        }
    }

    toastShow(message) {
        if (this.platform.is('cordova')) {
            this.toast.show(message, "short", "bottom").subscribe(
                toast => {
                    //console.log(toast);
                }
            );
        } else {
            let toast = this.toastCtrl.create({
                message: message,
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
        }
    }

    textToSpeech(text) {
        if (this.platform.is('cordova')) {
            const options: any = {
                text: text,
                locale: 'fr-FR'
            };
            this.tts.speak(options)
                .then(() => this.toastShow(text))
                .catch((reason: any) => console.log(reason));
        } else {
            // todo
            this.toastShow(text);
        }
    }

    setToken(token) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem('token', token)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.set('token', token));
        }
    }

    getToken() {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem('token')
                .then(
                    data => {
                        return Promise.resolve(data);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.get('token'));
        }
    }

    setTrackId(trackId) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem('trackId', trackId)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.set('trackId', trackId));
        }
    }

    getTrackId() {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem('trackId')
                .then(
                    data => {
                        return Promise.resolve(data);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.get('trackId'));
        }
    }

    setGranted(granted) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem('granted', granted)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.set('granted', granted));
        }
    }

    getGranted() {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem('granted')
                .then(
                    data => {
                        return Promise.resolve(data);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.get('granted'));
        }
    }

    setTokenSession(tokenSession) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem('tokenSession', tokenSession)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.set('tokenSession', tokenSession));
        }
    }

    getTokenSession() {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem('tokenSession')
                .then(
                    data => {
                        return Promise.resolve(data);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.get('tokenSession'));
        }
    }

    removeTokenSession() {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.remove('tokenSession')
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.remove('tokenSession'));
        }
    }

    setMusics(musics) {
        return new Promise(resolve => {
            if (this.platform.is('cordova')) {
                this.nativeStorage.setItem('musics', musics)
                    .then(
                        () => {
                            resolve(true);
                        },
                        error => {
                            resolve(false);
                        }
                    );
            } else {
                this.storage.set('musics', musics)
                    .then(
                    () => {
                        resolve(true);
                    },
                    error => {
                        resolve(false);
                    }
                );
            }
        });

    }

    getMusics() {
        return new Promise(resolve => {
            if (this.platform.is('cordova')) {
                this.nativeStorage.getItem('musics')
                    .then(
                        data => {
                            resolve(data);
                        },
                        error => {
                            resolve(false);
                        }
                    );
            } else {
                this.storage.get('musics').then(
                    data => {
                        resolve(data);
                    },
                    error => {
                        resolve(false);
                    });
            }
        });

    }

    setMusic(music: MediaModel) {
        return new Promise(resolve => {
            this.getMusics().then(musics => {
                let musicsToSave:any = [];
                if (musics) {
                    musicsToSave = musics;
                }
                musicsToSave.push(music);
                console.log(musicsToSave);
                this.setMusics(musicsToSave).then(
                    () => {
                        resolve(true);
                    },
                    () => {
                        resolve(false);
                    });
            });
        });

    }

    removeMusic(music: MediaModel) {
        return new Promise(resolve => {
            this.getMusics().then(getMusics => {
                const musics: any = getMusics;
                let musicsToSave:any = [];
                if (musics) {
                    musicsToSave = musics;
                    for(let i = 0; i < musics.length; i++) {
                        if (music.title == musics[i].title) {
                            musicsToSave.splice(i, 1);
                        }
                    }
                }
                this.setMusics(musicsToSave).then(
                    () => {
                        resolve(true);
                    },
                    () => {
                        resolve(false);
                    });
            });
        });
    }

    checkMusic(music: MediaModel) {
        return new Promise(resolve => {
            this.getMusics().then(getMusics => {
                const musics: any = getMusics;
                if (!musics) {
                    resolve(false);
                }
                for(let i = 0; i < musics.length; i++) {
                    if (music.title == musics[i].title) {
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    setVideos(videos) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem('videos', videos)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return this.storage.set('videos', videos)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        }
    }

    getVideos() {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem('videos')
                .then(
                    data => {
                        return Promise.resolve(data);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.get('videos'));
        }
    }

    setVideo(video: MediaModel) {
        return this.getVideos().then(videos => {
            let videosToSave:any = [];
            if (videos) {
                videosToSave = videos;
            }
            videosToSave.push(video);
            return this.setVideos(videosToSave).then(setVideos => {
                return setVideos;
            });
        });
    }

    removeVideo(video: MediaModel) {
        return this.getVideos().then(videos => {
            let videosToSave:any = [];
            if (videos) {
                videosToSave = videos;
                for(let i = 0; i < videos.length; i++) {
                    if (video.title == videos[i].title) {
                        videosToSave.splice(i, 1);
                    }
                }
            }
            return this.setVideos(videosToSave).then(setVideos => {
                return setVideos;
            });
        });
    }

    checkVideo(video) {
        return this.getVideos().then(videos => {
            if (!videos) {
                return false;
            }
            for(let i = 0; i < videos.length; i++) {
                if (video.title === videos[i].title) {
                    return true;
                }
            }
            return false;
        });
    }

}

