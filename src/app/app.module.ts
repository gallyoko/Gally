import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {IonicStorageModule} from '@ionic/storage';
import {HttpClientModule} from '@angular/common/http';
import {MyApp} from './app.component';

import {AboutPage} from '../pages/about/about';
import {ContactPage} from '../pages/contact/contact';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';

import {CommonService} from '../providers/common-service';
import {ExecService} from '../providers/exec-service';
import {SpeechService} from '../providers/speech-service';
import {FreeboxService} from '../providers/freebox-service';

import {Toast} from '@ionic-native/toast';
import {SpinnerDialog} from '@ionic-native/spinner-dialog';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SpeechRecognition} from '@ionic-native/speech-recognition';
import {TextToSpeech} from '@ionic-native/text-to-speech';
import {NativeStorage} from '@ionic-native/native-storage';

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        ContactPage,
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
        AboutPage,
        ContactPage,
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
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        CommonService,
        ExecService,
        SpeechService,
        FreeboxService
    ]
})
export class AppModule {
}
