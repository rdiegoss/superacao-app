import { Injectable } from '@angular/core';
import { AuthProviders, AngularFireAuth, AuthMethods, AngularFire } from 'angularfire2';
import { UserStorageService } from './user-storage-service';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { Observable } from 'rxjs/Observable';
import firabase from 'firebase';

@Injectable()
export class AuthService {

  constructor(
    public auth: AngularFireAuth,
    public af: AngularFire,
    public userStorageService: UserStorageService,
    public platform: Platform,
    private facebook: Facebook) {

  }

  getAuthentication() {
    return this.auth;
  }

  signWithFacebook() {
    let user = null;
    if(this.platform.is('cordova')) {
      return this.facebook.login(['email', 'public_profile']).then((res) => {
        const facebookCredentials = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredentials);
      })
      .then(findUser.bind(this))
      .then(verifyIfRegisterUser.bind(this))
    } else {
      return this.auth.login({
        provider: AuthProviders.Facebook,
        method: AuthMethods.Popup
      })
      .then(findUser.bind(this))
      .then(verifyIfRegisterUser.bind(this))
      .then(updateTokenDevice.bind(this));
    }

    function findUser(datas) {
      user = datas;
      return this.userStorageService.findUser(user.uid);
    }

    function verifyIfRegisterUser(datas) {
      if(datas.$value === null) {
        return this.userStorageService.registerUser(user);
      }
      return datas;
    }

    function updateTokenDevice() {
      this.userStorageService.updateTokenDevice(user.uid)
    }
  }

  signUpWithEmail(credentials) {
    let user = credentials;
    return this.af.auth.createUser({
      email: credentials.email,
      password: credentials.password
    }).then((credentials) => {
      this.userStorageService.registerUser(credentials, user);
    });
  }

  signInWithEmail(credentials) {
    return this.af.auth.login(credentials, {
      provider: AuthProviders.Password,
      method: AuthMethods.Password
    }).then((user) => {
      this.userStorageService.updateTokenDevice(user.uid)
    });
  }

  signOut() {
    this.auth.logout();
  }
}
