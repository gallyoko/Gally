import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CommonService } from '../../providers/common-service';

@Component({
  selector: 'page-config',
  templateUrl: 'config.html',
    providers: [CommonService]
})
export class ConfigPage {

  constructor(public navCtrl: NavController, private commonService: CommonService) {
    this.commonService.toastShow('ok');
  }

}
