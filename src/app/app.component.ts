import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';
import * as firebase from "firebase/app";

import { GameControllerProvider } from '../providers/game-controller/game-controller';

import { HomePage } from '../pages/home/home';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDR9qWel2I2_PCpZwn_crw-SH-uAug5zIw",
  authDomain: "quizpad-ff712.firebaseapp.com",
  databaseURL: "https://quizpad-ff712.firebaseio.com",
  projectId: "quizpad-ff712",
  storageBucket: "quizpad-ff712.appspot.com",
  messagingSenderId: "699661197913",
  appId: "1:699661197913:web:2abeed2df8580fa9"
};

@Component({
  templateUrl: 'app.component.html',
  providers: [GameControllerProvider]
})
export class AppComponent {
  rootPage:any;
  rootPageParams:any;

  constructor(platform: Platform, splashScreen: SplashScreen,
    private translate: TranslateService,
    private globalization: Globalization) {

    this.rootPage = HomePage;
    this.rootPageParams = {gameID: location.search.split('?id=')[1]};

    platform.ready().then(() => {
      //Set available languages
      translate.addLangs(['en', 'fr', 'de']);

      // Set default language
      this.globalization.getPreferredLanguage().then((res) => {
        res.value = res.value.toLowerCase();

        if (res.value.includes('-')) res.value = res.value.split('-')[0];

        if (translate.getLangs().indexOf(res.value) !== -1) {
          translate.setDefaultLang(res.value);
        } else {
          translate.setDefaultLang('en');
        }
      }).catch((error) => {
        translate.setDefaultLang('en');
      });

      // Initialize Firebase
      firebase.initializeApp(FIREBASE_CONFIG);

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      splashScreen.hide();
    });
  }
}
