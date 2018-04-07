import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {SpeechRecognition} from '@ionic-native/speech-recognition';
import {CommonService} from './common-service';
import {ExecService} from './exec-service';
import * as annyang from 'annyang';
import 'rxjs/add/operator/map';

@Injectable()
export class SpeechService {
    private commands: any = null;
    private textCommands: any = null;
    private regexCommands: any = null;
    private commandToRegExp: any = null;

    constructor(private platform: Platform, private commonService: CommonService,
                private execService: ExecService, private speechRecognition: SpeechRecognition) {
        this.initCommandEngine();
        this.setCommands();
    }

    initCommandEngine() {
        this.commands = new Object();
        this.regexCommands = [];
        this.textCommands = [];
        let optionalParam = /\s*\((.*?)\)\s*/g;
        let optionalRegex = /(\(\?:[^)]+\))\?/g;
        let namedParam    = /(\(\?)?:\w+/g;
        let splatParam    = /\*\w+/g;
        let escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#]/g;
        this.commandToRegExp = function(command) {
            command = command.replace(escapeRegExp, '\\$&')
                .replace(optionalParam, '(?:$1)?')
                .replace(namedParam, function(match, optional) {
                    return optional ? match : '([^\\s]+)';
                })
                .replace(splatParam, '(.*?)')
                .replace(optionalRegex, '\\s*$1?\\s*');
            return new RegExp('^' + command + '$', 'i');
        };
    }

    startSpeechRecognition() {
        if (this.platform.is('cordova')) {
            this.speechRecognition.isRecognitionAvailable()
                .then((available: boolean) => {
                if (available) {
                    this.speechRecognition.startListening()
                        .subscribe(
                            (matches: Array<string>) => {
                                if (matches.length > 0) {
                                    if (!this.checkCommand(matches[0])) {
                                        this.commonService.textToSpeech("Aucune correspondance pour : " + matches[0]);
                                    }
                                } else {
                                    this.commonService.textToSpeech("J'ai pas tout compris !");
                                }

                            },
                            () => {
                                this.commonService.textToSpeech("Tu dois autoriser l'accès au micro !");
                            }
                        )
                } else {
                    this.commonService.textToSpeech('la reconnaissance vocale ne fonctionne pas !');
                }
            });
        } else {
            if (annyang) {
                annyang.setLanguage('fr-FR');
                const motor: any = this;
                annyang.addCallback('result', function(matches) {
                    if (matches.length > 0) {
                        if (!motor.checkCommand(matches[0])) {
                            motor.commonService.textToSpeech("Aucune correspondance pour : " + matches[0]);
                        }
                    } else {
                        motor.commonService.textToSpeech("J'ai pas tout compris !");
                    }
                });
                annyang.addCallback('end', function() {
                    this.removeCallback('result');
                });
                annyang.start({ autoRestart: false, continuous: false });
            } else {
                this.commonService.textToSpeech('la reconnaissance vocale ne fonctionne pas !');
            }
        }
    }

    checkCommand(command) {
        let findCommand: any = false;
        for (let i = 0; i < this.regexCommands.length; i++) {
            let commandMatch = command.match(this.regexCommands[i]);
            if (commandMatch ) {
                findCommand = true;
                const commandName: any = this.textCommands[i].toLowerCase();
                const matchExtract: any = String(commandMatch);
                const parametersString: any = matchExtract.replace(command+',', '');
                const parameters: any = parametersString.split(',');
                if (parameters.length > 0) {
                    this.commands[commandName](parameters);
                } else {
                    this.commands[commandName]();
                }
            }
        }
        return findCommand;
    }

    setCommands() {
        const motor: any = this;
        const commands: any = [];
        commands.push({name: 'oui', execFunction: function() { motor.execService.yes(); }});
        commands.push({name: 'non', execFunction: function() { motor.execService.no(); }});
        commands.push({name: 'comment vas-tu', execFunction: function() { motor.execService.howAreYou(motor); }});
        commands.push({name: 'coucou', execFunction: function() { motor.commonService.textToSpeech('Coucou Fred !'); }});
        commands.push({name: 'hello', execFunction: function() { motor.commonService.textToSpeech('Hello Fred !'); }});
        commands.push({name: 'coucou c\'est *name', execFunction: function(parameters) { motor.execService.checkCoucou(motor, parameters); }});
        commands.push({name: 'ton maître', execFunction: function() { motor.execService.analizeName(['ton maître']); }});
        commands.push({name: 'c\'est *name', execFunction: function(parameters) { motor.execService.analizeName(parameters); }});
        commands.push({name: '*action la lumière du *room', execFunction: function(parameters) { motor.execService.checkLight(parameters, 'du');}});
        commands.push({name: '*action la lumière de la *room', execFunction: function(parameters) { motor.execService.checkLight(parameters, 'de la');}});
        commands.push({name: 'connecte-toi à la freebox', execFunction: function() { motor.execService.connectFreebox();}});
        commands.push({name: 'balance la *media', execFunction: function(parameters) { motor.execService.launchMediaFreebox(parameters);}});
        commands.push({name: 'balance un morceau', execFunction: function() { motor.execService.launchMediaFreebox(['musique']);}});
        commands.push({name: 'mets un peu de musique', execFunction: function() { motor.execService.launchMediaFreebox(['musique']);}});
        commands.push({name: 'arrête la *media', execFunction: function(parameters) { motor.execService.stopMediaFreebox(parameters);}});
        commands.push({name: 'affiches-moi les serveurs disponibles', execFunction: function() { motor.execService.showServerListFreebox();}});
        commands.push({name: 'scan le répertoire *directory', execFunction: function(parameters) { motor.execService.scanDirectoryFreebox(parameters);}});
        commands.push({name: 'mets la chaîne *channel', execFunction: function(parameters) { motor.execService.launchChannelFreebox(parameters);}});
        commands.push({name: 'affiche-moi ma position', execFunction: function() { motor.execService.getCurrentPosition();}});
        commands.push({name: 'donne-moi ma position', execFunction: function() { motor.execService.getCurrentPosition();}});
        commands.push({name: 'localise-moi', execFunction: function() { motor.execService.getCurrentPosition();}});

        for (let i = 0; i < commands.length; i++) {
            this.regexCommands.push(this.commandToRegExp(commands[i].name));
            this.textCommands.push(commands[i].name);
            this.commands[commands[i].name] = commands[i].execFunction;
        }
    }
}