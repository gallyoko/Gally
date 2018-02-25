import { Component } from '@angular/core';

import { CommandPage } from '../command/command';
import { ConfigPage } from '../config/config';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = CommandPage;
  tab3Root = ConfigPage;

  constructor() {

  }
}
