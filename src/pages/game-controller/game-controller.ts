import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { GameState } from '../../models/game';

import { GameControllerProvider } from '../../providers/game-controller/game-controller';

@Component({
  selector: 'page-game-controller',
  templateUrl: 'game-controller.html'
})

export class GameControllerPage {
  private GameState = GameState; //for use in Angluar html

  constructor(
    private alertCtrl: AlertController,
    private sanitizer:DomSanitizer,
    private gameControllerProv: GameControllerProvider,
    private translate: TranslateService) {

  }

  setAnswer(index: number) {
    if (this.gameControllerProv.player.answer === -1) {
      this.gameControllerProv.setPlayerAnswer(index).catch(() => {
        this.showSetAnswerErrorAlert();
      });
    }
  }

  showSetAnswerErrorAlert() {
    let message = this.alertCtrl.create({
      title: this.translate.instant('SET_ANSWER_ERROR'),
      message: this.translate.instant('TRY_AGAIN'),
      buttons: [
        {
          text: this.translate.instant('CLOSE'),
          role: 'ok',
        }
      ]
    });

    message.present();
  }

  renderPicture(base64: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${base64}')`);
  }

  /* this will be executed when view is poped, either by exit() or by back button */
  ionViewWillUnload() {
    this.gameControllerProv.leaveGame().catch(() => {
      console.log("Could not leave game properly");
    });
  }
}
