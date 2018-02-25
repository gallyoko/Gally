import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import {CommonService} from './common-service';
import 'rxjs/add/operator/map';

@Injectable()
export class FreeboxService {
    private routeApi: any;
    private appId: any = 'fr.gallyoko.gally';
    private routeAuth: any;
    private routeTracking: any;
    private routeLogin: any;
    private routeLoginSession: any;
    private routelaunchMedia: any;
    private routeAirMedia: any;
    private routeLsPath: any;

    constructor(public http: HttpClient, public commonService: CommonService) {
        this.routeApi = '/api/'; // => pour le dev
        //this.routeApi = 'http://mafreebox.freebox.fr/api/v4/'; // => pour la prod
        this.routeAuth = this.routeApi + 'login/authorize/';
        this.routeTracking = this.routeApi + 'login/authorize/';
        this.routeLogin = this.routeApi + 'login';
        this.routeLoginSession = this.routeApi + 'login/session';
        this.routeAirMedia = this.routeApi + 'airmedia/receivers/';
        this.routelaunchMedia = this.routeApi + 'airmedia/receivers/Freebox%20Player/';
        this.routeLsPath = this.routeApi + 'fs/ls/';
    }

    auth() {
        return new Promise(resolve => {
            let request: any = {
                "app_id": this.appId,
                "app_name": "Gally",
                "app_version": "1.0a",
                "device_name": "Gally"
            };
            let param: any = JSON.stringify(request);
            this.http.post(this.routeAuth, param)
                .subscribe(
                    response => {
                        if (response['success']) {
                            this.commonService.setToken(response['result']['app_token']).then(setToken => {
                                if (setToken) {
                                    this.commonService.setTrackId(response['result']['track_id']).then(setTrackId => {
                                        if (setTrackId) {
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    });
                                } else {
                                    resolve(false);
                                }
                            });
                        } else {
                            resolve(false);
                        }
                    },
                    err => {
                        resolve(false);
                    }
                );
        });
    }

    getStatus() {
        return new Promise(resolve => {
            this.commonService.getTrackId().then(trackId => {
                if (!trackId) {
                    resolve('errorTrackId');
                } else {
                    this.http.get(this.routeTracking + trackId)
                        .subscribe(
                            response => {
                                if (response['success']) {
                                    let status: any = response['result']['status'];
                                    if (status == 'granted') {
                                        this.commonService.setGranted(true).then(granted => {
                                            if (granted) {
                                                resolve(status);
                                            } else {
                                                resolve('errorSet');
                                            }
                                        });
                                    } else {
                                        resolve(status);
                                    }
                                } else {
                                    resolve('errorCall');
                                }
                            },
                            err => {
                                resolve('errorInternal');
                            }
                        );
                }
            });
        });
    }

    challenge() {
        return new Promise(resolve => {
            let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
            const reqOpts = {
                headers: header
            };
            this.http.get(this.routeLogin, reqOpts)
                .subscribe(
                    response => {
                        if (response['success']) {
                            let challenge: any = response['result']['challenge'];
                            this.commonService.getToken().then(token => {
                                let password: any = CryptoJS.HmacSHA1(challenge, token);
                                let encPassword: any = password.toString(CryptoJS.enc.Hex);
                                this.loginSession(encPassword).then(loginSession => {
                                    resolve(loginSession);
                                });
                            });
                        } else {
                            resolve(false);
                        }
                    },
                    err => {
                        resolve(false);
                    }
                );
        });
    }

    loginSession(password) {
        return new Promise(resolve => {
            let request: any = {
                "app_id": this.appId,
                "password": password
            };
            let param: any = JSON.stringify(request);
            let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
            const reqOpts = {
                headers: header
            };
            this.http.post(this.routeLoginSession, param, reqOpts)
                .subscribe(
                    response => {
                        if (response['success']) {
                            this.commonService.setTokenSession(response['result']['session_token']).then(set => {
                                resolve(response['result']['session_token']);
                            });

                        } else {
                            this.commonService.removeTokenSession().then(() => {
                                resolve(false);
                            });
                        }
                    },
                    () => {
                        this.commonService.removeTokenSession().then(() => {
                            resolve(false);
                        });
                    }
                );
        });
    }

    launch(method=null, parameters=[]) {
        return new Promise(resolve => {
            if (method) {
                this.commonService.getTokenSession().then(tokenSession => {
                    if (tokenSession) {
                        this[method](tokenSession, parameters).then(launch => {
                            if (!launch['success']) {
                                this.challenge().then(tokenSession => {
                                    if (tokenSession) {
                                        this[method](tokenSession, parameters).then(launch => {
                                            resolve(launch);
                                        });
                                    } else {
                                        resolve({'success': false});
                                    }
                                });
                            } else {
                                resolve(launch);
                            }
                        });
                    } else {
                        this.challenge().then(tokenSession => {
                            if (tokenSession) {
                                this[method](tokenSession, parameters).then(launch => {
                                    resolve(launch);
                                });
                            } else {
                                resolve({'success': false});
                            }
                        });
                    }
                });
            } else {
                resolve({'success': false})
            }
        });

    }

    startMedia(tokenSession) {
        return new Promise(resolve => {
            let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
                .set('X-Fbx-App-Auth', tokenSession);
            const reqOpts = {
                headers: header
            };
            const request: any = {
                "action": "start",
                "media_type": "video",
                "media": 'http://mafreebox.freebox.fr/share/6Ao9E-t242TLCTCf/04%20-%20Hand%20in%20My%20Pocket.mp3'
            };
            const parameters: any = JSON.stringify(request);
            this.http.post(this.routelaunchMedia, parameters, reqOpts)
                .subscribe(
                    response => {
                        resolve(response);
                    },
                    err => {
                        resolve({'success': false});
                    }
                );
        });
    }

    stopMedia(tokenSession) {
        return new Promise(resolve => {
            let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
                .set('X-Fbx-App-Auth', tokenSession);
            const reqOpts = {
                headers: header
            };

            const request: any = {
                "action": "stop",
                "media_type": "video"
            };
            const parameters: any = JSON.stringify(request);
            this.http.post(this.routelaunchMedia, parameters, reqOpts)
                .subscribe(
                    response => {
                        resolve(response);
                    },
                    err => {
                        resolve({'success': false});
                    }
                );
        });
    }

    getServerMediaList(tokenSession) {
        return new Promise(resolve => {
            let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
                .set('X-Fbx-App-Auth', tokenSession);
            const reqOpts = {
                headers: header
            };
            this.http.get(this.routeAirMedia, reqOpts)
                .subscribe(
                    response => {
                        console.log(response);
                        resolve(response);
                    },
                    err => {
                        resolve({'success': false});
                    }
                );
        });
    }

    getDirectoryInfo(tokenSession, parameters=[]) {
        return new Promise(resolve => {
            let header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
                .set('X-Fbx-App-Auth', tokenSession);
            const reqOpts = {
                headers: header
            };
            this.http.get(this.routeLsPath + btoa(parameters['path']), reqOpts)
                .subscribe(
                    response => {
                        console.log(response);
                        resolve(response);
                    },
                    err => {
                        resolve({'success': false});
                    }
                );
        });
    }

}
