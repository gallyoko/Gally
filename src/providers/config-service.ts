import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class ConfigService {
    public env: any;
    public urlExternFreebox: any;
    public urlLocalFreebox: any;
    public urlPlaylistFreebox: any;
    public urlApiFreebox: any;
    public urlApiPerso: any;
    public appId: any;
    public appVersion: any;
    public appName: any;
    public appDevice: any;
    public pathMusic: any;
    public pathVideo: any;
    public ExtensionMusic: any = [];
    public ExtensionVideo: any = [];

    constructor() {
        this.env = 'dev';
        //this.env = 'prod';

        this.urlExternFreebox = 'https://fwed.freeboxos.fr:16129';
        this.urlLocalFreebox = 'http://mafreebox.freebox.fr';
        this.appId = 'fr.gallyoko.gally';
        this.appVersion = '1.0';
        this.appName = 'Gally';
        this.appDevice = 'Gally';
        this.pathMusic = '/Disque dur/Musiques';
        this.pathVideo = '/Disque dur/Videos';
        this.ExtensionMusic = ['mp3', 'flac'];
        this.ExtensionVideo = ['avi', 'mkv'];
        if (this.env === 'dev') {
            this.urlApiFreebox = '/api/';
            //this.urlApiPerso = '/perso/';
            this.urlApiPerso = 'http://172.20.0.2:8091/api/';
            this.urlPlaylistFreebox = '/playlist/playlist.m3u';
        } else {
            this.urlApiFreebox = 'http://mafreebox.freebox.fr/api/v4/';
            this.urlApiPerso = 'http://172.20.0.2:8091/api/';
            this.urlPlaylistFreebox = 'http://mafreebox.freebox.fr/freeboxtv/playlist.m3u';
        }
    }


}

