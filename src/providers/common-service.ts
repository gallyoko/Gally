import {Injectable} from '@angular/core';
import {Platform, LoadingController, ToastController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {SpinnerDialog} from '@ionic-native/spinner-dialog';
import {Toast} from '@ionic-native/toast';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import {NativeStorage} from '@ionic-native/native-storage';
import {Geolocation} from '@ionic-native/geolocation';
import {AndroidPermissions} from '@ionic-native/android-permissions';
import 'rxjs/add/operator/map';

@Injectable()
export class CommonService {

    private loader: any = null;

    constructor(private platform: Platform,
                private loadingCtrl: LoadingController, private toastCtrl: ToastController,
                private spinnerDialog: SpinnerDialog, private toast: Toast, private tts: TextToSpeech,
                private nativeStorage: NativeStorage, private storage: Storage, private geolocation: Geolocation,
                private androidPermissions: AndroidPermissions) {

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
            this.toast.show(message, "short", "bottom");
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
        const motor: any = this;
        if (this.platform.is('cordova')) {
            const options: any = {
                text: text,
                locale: 'fr-FR'
            };
            this.tts.speak(options)
                .then(() => motor.toastShow(text))
                .catch((error) => {
                    motor.toastShow('Erreur de synthétisation vocale.');
                    console.log(error);
                });
        } else {
            const voices = speechSynthesis.getVoices();
            let message:any = new SpeechSynthesisUtterance(text);
            message.voice = voices[6]; // french
            message.volume = 1;
            message.pitch = 1;
            message.rate = 1;
            message.onerror = function(error) {
                motor.toastShow('Erreur de synthétisation vocale.');
                console.log(error);
            };
            message.onend = function() {
                motor.toastShow(text);
            };
            speechSynthesis.speak(message);
        }
    }

    setElement(name, value) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.setItem(name, value)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.set(name, value));
        }
    }

    getElement(name) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.getItem(name)
                .then(
                    data => {
                        return Promise.resolve(data);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.get(name));
        }
    }

    removeElement(name) {
        if (this.platform.is('cordova')) {
            return this.nativeStorage.remove(name)
                .then(
                    () => {
                        return Promise.resolve(true);
                    },
                    error => {
                        return Promise.resolve(false);
                    }
                );
        } else {
            return Promise.resolve(this.storage.remove(name));
        }
    }

    concatElementArray(name, value) {
        return new Promise(resolve => {
            this.getElement(name).then(elements => {
                let elementsToSave: any = [];
                if (elements) {
                    elementsToSave = elements;
                }
                elementsToSave.push(value);
                this.setElement('name', elementsToSave).then(
                    () => {
                        resolve(true);
                    },
                    () => {
                        resolve(false);
                    });
            });
        });
    }

    removeElementArray(name, value) {
        return this.getElement(name).then(elements => {
            let elementsToSave: any = [];
            if (elements) {
                elementsToSave = elements;
                for (let i = 0; i < elements.length; i++) {
                    if (value.title == elements[i].title) {
                        elementsToSave.splice(i, 1);
                    }
                }
            }
            return this.setElement(name, elementsToSave).then(setElements => {
                return setElements;
            });
        });
    }

    getCurrentPosition() {
        return new Promise(resolve => {
            if (this.platform.is('cordova')) {
                this.geolocation.getCurrentPosition().then((position) => {
                    resolve(position);
                }).catch(() => {
                    resolve(false);
                });
            } else {
                navigator.geolocation.getCurrentPosition(function (position) {
                    resolve(position);
                });
            }
        });
    }

    checkPermission(service: string) {
        return new Promise(resolve => {
            if (this.platform.is('cordova')) {
                this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION[service]).then(
                    result => resolve(result.hasPermission),
                    err => resolve(false)
                );
            } else {
                resolve(true);
            }
        });
    }

    requestPermission(service) {
        return new Promise(resolve => {
            if (this.platform.is('cordova')) {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION[service]).then(
                    result => resolve(result.hasPermission),
                    err => resolve(false)
                );
            } else {
                resolve(true);
            }
        });
    }

}

