import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, LoadingController, AlertController, NavParams } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { TranslateService } from '@ngx-translate/core';

import { UserProfile } from '../../models/user-profile';

import { GameControllerProvider } from '../../providers/game-controller/game-controller';

import { GameControllerPage } from '../../pages/game-controller/game-controller';

const MAX_PICTURE_WIDTH: number = 512;
const MAX_PICTURE_HEIGHT: number = 512;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  private gameID: string;  //for use in Angluar html
  private profile: UserProfile;

  constructor(public navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private imagePicker: ImagePicker,
              private sanitizer:DomSanitizer,
              private gameControllerProv: GameControllerProvider,
              private translate: TranslateService,
              params: NavParams) {

    this.profile = {
      uuid: '',
      nickname: '',
      avatar : '',
      email: ''
    }

    if (params.data.gameID) {
      this.gameID = params.data.gameID;
    }
  }

  enableJoinButton() {
    let enable: boolean = false;
    if (this.profile.nickname) {
      if (this.profile.nickname.length > 2) {
        enable = true;
      }
    }
    return enable;
  }

  joinGame(gameID: string, alternativeNickname?: string) {
    let loading = this.loadingCtrl.create({
      content: this.translate.instant('JOINING')
    });

    loading.present();

    this.resizeAvatar(this.profile.avatar).then((resizedAvatar) => {

      this.gameControllerProv.joinGame(gameID, alternativeNickname ? alternativeNickname : this.profile.nickname, resizedAvatar).then(() => {
        loading.dismiss();
        this.navCtrl.push(GameControllerPage);
      }).catch((error) => {
        loading.dismiss();
        if (error === 20) {
          this.showNicknameAlreadyUsedAlert(gameID);
        } else {
          this.showGeneralErrorAlert(this.translate.instant('GENERAL_ERROR'), this.translate.instant('JOIN_GAME_ERROR') + ': ' + error + '.');
        }
      });
    }).catch((error) => {
      loading.dismiss();
      this.showGeneralErrorAlert(this.translate.instant('GENERAL_ERROR'), this.translate.instant('RESIZE_AVATAR_ERROR'));
    });
  }

  showNicknameAlreadyUsedAlert(gameID: string) {
    let alertMsg = this.alertCtrl.create({
      title: this.translate.instant('NICKNAME_ALREADY_USED'),
      message: this.translate.instant('NICKNAME_ALREADY_USED_INFO'),
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'nickname',
          placeholder: this.translate.instant('NICKNAME_NEW')
        }
      ],
      buttons: [
        {
          text: this.translate.instant('CANCEL'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('JOIN'),
          handler: data => {
            this.joinGame(gameID, data.nickname);
          }
        }
      ]
    });
    alertMsg.present();
  }

  showGeneralErrorAlert(title: string, content: string) {
    let message = this.alertCtrl.create({
      title: title,
      message: content,
      buttons: [
        {
          text: this.translate.instant('CLOSE'),
          role: this.translate.instant('OK'),
        }
      ]
    });

    message.present();
  }

  resizeAvatar(base64Avatar: string) {
    return new Promise<string>((resolve, reject) => {
      //First resize the image
      //The zoom it like avatar displayed
      //https://zocada.com/compress-resize-images-javascript-browser/
      //https://stackoverflow.com/a/28048865/7890583
      let img = new Image();
      img.src = base64Avatar;
      img.onload = (pic: any) => {
        let canvas = document.createElement('canvas');
        let imgRatio: number = img.width / img.height;
        let zoom: number;
        let newImgHeight: number;
        let newImgWidth: number;
        let heightMargin: number = 0;
        let widthMargin: number = 0;

        canvas.width = 200;
        canvas.height = 200;

        if (imgRatio > 1) {
          zoom = img.height / canvas.height;
          newImgHeight = canvas.height;
          newImgWidth = img.width / zoom;
          widthMargin = -(newImgWidth / 2) + (canvas.width / 2);
        } else {
          zoom = img.width / canvas.width;
          newImgHeight = img.height / zoom;
          newImgWidth = canvas.width;
          heightMargin = -(newImgHeight / 2) + (canvas.height / 2);
        }

        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, widthMargin, heightMargin, newImgWidth, newImgHeight);
        resolve(ctx.canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = (error : any) => {
        resolve('');
      }
    });
  }

  openMobileImagePicker() {
    this.imagePicker.getPictures({maximumImagesCount: 1, width:MAX_PICTURE_WIDTH, height: MAX_PICTURE_HEIGHT, quality: 80, outputType: 1}).then((results) => {
      if (results.length === 1) {
        this.profile.avatar = 'data:image/jpeg;base64,' + results[0];
      }
    }).catch(() => {
      alert('Could not get images.');
    });
  }

  renderPicture(base64: string) {
    return this.sanitizer.bypassSecurityTrustUrl(base64);
  }
}
