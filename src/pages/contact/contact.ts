import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CommonService } from '../../providers/common-service';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html',
    providers: [CommonService]
})
export class ContactPage {

  constructor(public navCtrl: NavController, private commonService: CommonService) {
    this.commonService.toastShow('ok');
  }

}
