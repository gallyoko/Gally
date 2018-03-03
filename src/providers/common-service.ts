import {Injectable} from '@angular/core';
import {Platform, LoadingController, ToastController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {SpinnerDialog} from '@ionic-native/spinner-dialog';
import {Toast} from '@ionic-native/toast';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';

@Injectable()
export class CommonService {

    private loader: any = null;

    constructor(private platform: Platform,
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
                let elementsToSave:any = [];
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
            let elementsToSave:any = [];
            if (elements) {
                elementsToSave = elements;
                for(let i = 0; i < elements.length; i++) {
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

}

