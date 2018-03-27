import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {IonicStorageModule} from '@ionic/storage';
import {HttpClientModule} from '@angular/common/http';
import {MyApp} from './app.component';

import {CommandPage} from '../pages/command/command';
import {ConfigPage} from '../pages/config/config';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';

import {CommonService} from '../providers/common-service';
import {ExecService} from '../providers/exec-service';
import {SpeechService} from '../providers/speech-service';
import {FreeboxService} from '../providers/freebox-service';
import {LightService} from '../providers/light-service';
import {ConfigService} from '../providers/config-service';

import {Toast} from '@ionic-native/toast';
import {SpinnerDialog} from '@ionic-native/spinner-dialog';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SpeechRecognition} from '@ionic-native/speech-recognition';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import {NativeStorage} from '@ionic-native/native-storage';
import {Geolocation} from '@ionic-native/geolocation';
import {AndroidPermissions} from '@ionic-native/android-permissions';

@NgModule({
    declarations: [
        MyApp,
        CommandPage,
        ConfigPage,
        HomePage,
        TabsPage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        CommandPage,
        ConfigPage,
        HomePage,
        TabsPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Toast,
        SpinnerDialog,
        TextToSpeech,
        SpeechRecognition,
        NativeStorage,
        Geolocation,
        AndroidPermissions,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        CommonService,
        ExecService,
        SpeechService,
        FreeboxService,
        LightService,
        ConfigService
    ]
})
export class AppModule {
}
