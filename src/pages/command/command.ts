import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-command',
  templateUrl: 'command.html'
})
export class CommandPage {
  private commands: any = [];

  constructor(public navCtrl: NavController) {
      const commands: any = [];
      commands.push({name: 'coucou'});
      commands.push({name: 'hello'});
      commands.push({name: 'comment vas-tu'});
      commands.push({name: 'coucou c\'est *name'});
      commands.push({name: 'ton maître'});
      commands.push({name: 'c\'est *name'});
      commands.push({name: '*action la lumière du *room'});
      commands.push({name: '*action la lumière de la *room'});
      commands.push({name: 'connecte-toi à la freebox'});
      commands.push({name: 'balance la *media'});
      commands.push({name: 'balance un morceau'});
      commands.push({name: 'mets un peu de musique'});
      commands.push({name: 'arrête la *media'});
      commands.push({name: 'affiches-moi les serveurs disponibles'});
      commands.push({name: 'scan le répertoire *directory'});
      commands.push({name: 'mets la chaîne *channel'});
      commands.push({name: 'affiche-moi ma position'});
      commands.push({name: 'donne-moi ma position'});
      commands.push({name: 'localise-moi'});
      this.commands = commands;

  }

}
