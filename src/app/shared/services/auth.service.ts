import { ElementRef, Injectable, NgZone, ViewChild } from '@angular/core';
import { User } from './user';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import {
  AngularFireDatabaseModule,
  AngularFireList,
} from '@angular/fire/compat/database';
import { FirebaseApp } from '@angular/fire/app';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EmailValidator } from '@angular/forms';
import { escapeRegExp } from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  userData: any;
  newUserData: any;
  isSignedIn = false;
  constructor(
    public storage: AngularFireStorage,
    public db: AngularFireDatabaseModule,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    public afs: AngularFirestore // public storageRef: AngularFireStorageReference, // public storageTask: AngularFireUploadTask
  ) {
    // firebase.firestore().settings({ experimentalAutoDetectLongPolling: true });
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;

        this.getUserDoc(this.userData!.uid).subscribe((res) => {
          this.userData = res;
        });

        // localStorage.setItem('user', JSON.stringify(this.userData));
        // JSON.parse(localStorage.getItem('user')!);
        // console.log(
        //   'Local Storage',
        //   JSON.parse(localStorage.getItem('user')!)
        // );

        // this.getUserDoc(this.userData!.uid).subscribe((res) => {
        //   this.userData = res;
        // });
        // if (this.userData.emailVerified) {
        //   console.log('UserData.Email Verified: ', this.userData.emailVerified);
        //   this.router.navigate(['dashboard']);
        // }
      } else {
        localStorage.setItem('user', null!);
        JSON.parse(localStorage.getItem('user')!);
      }
    });

    console.log('Calling from the constructor', this.userData);
  }

  signIn(email: string, password: string) {
    // console.log('click');
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        var user = result.user;
        var pass = password;
        var verifiedEmail = result.user?.emailVerified;
        this.ngZone.run(() => {
          if (!verifiedEmail) {
            window.alert('Check your indox and verify email');
            this.SendVerificationMail();
          } else {
            if (
              result.user?.emailVerified === this.userData.emailVerified &&
              password === this.userData.password
            ) {
              console.log('Verified:', result.user?.emailVerified);
              this.isSignedIn = true;
              localStorage.setItem('user', JSON.stringify(this.userData));
              JSON.parse(localStorage.getItem('user')!);
              this.router.navigate(['dashboard']);
            } else {
              const userRef: AngularFirestoreDocument<any> = this.afs.doc(
                `user/${user!.uid}`
              );
              const userData: User = {
                uid: user!.uid,
                email: email,
                displayName: this.userData!.displayName,
                photoURL: this.userData!.photoURL,
                emailVerified: user!.emailVerified,
                password: pass,
              };

              userRef.update(userData);
              this.router.navigate(['dashboard']);
            }
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  signUp(name: string, email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        const userName = name;
        const pass = password;
        this.addUserData(result.user, userName, pass);

        this.SendVerificationMail();
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }
  SendVerificationMail() {
    return this.afAuth.currentUser.then((u) =>
      u?.sendEmailVerification().then((res) => {
        this.router.navigate(['verify-email-address']);
      })
    );
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;

        // console.log(user?.uid);
        const userRef = this.afs.collection('user').doc(user!.uid);
        console.log('Facebook Email Verified: ', user?.emailVerified);
        const emailVerified = user?.emailVerified;
        if (emailVerified) {
          userRef.get().subscribe((res) => {
            if (res.exists) {
              console.log('exists');
              this.router.navigate(['dashboard']);
            } else {
              this.SetUserData(result.user);

              this.router.navigate(['dashboard']);
            }
          });
        } else {
          this.SendVerificationMail();
          window.alert('Check your inbox to verify your email!');
        }
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `user/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified ? user.emailVerified : true,
      password: user.password ? user.password : '',
    };
    return userRef.set(userData, {
      merge: true,
    });
  }
  addUserData(user: any, userName: string, pass: string) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `user/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: userName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      password: pass,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }

  FacebookAuth() {
    return this.AuthLogin(new firebase.auth.FacebookAuthProvider()).catch(
      (error) => {
        window.alert(error);
      }
    );
  }
  title = 'cloudstorage';
  selectedFile!: File;
  fb!: any;
  downloadUrl!: Observable<string>;

  changeProfileImage(event: Event, userId: AngularFireAuth) {
    var n = Date.now();
    const file = (<HTMLInputElement>event.target).files![0];
    const filePath = `UserImages/${this.userData.uid}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadUrl = fileRef.getDownloadURL();
          this.downloadUrl.subscribe((url) => {
            if (url) {
              this.fb = url;
            }
            const userRef: AngularFirestoreDocument<any> = this.afs.doc(
              `user/${userId}`
            );

            const userData: User = {
              uid: this.userData.uid,
              email: this.userData.email,
              displayName: this.userData.displayName,
              photoURL: this.fb,
              emailVerified: this.userData.emailVerified,
              password: this.userData.password,
            };

            userRef.update(userData);

            // userData.photoURL = this.fb;
          });
        })
      )
      .subscribe((url) => {});
  }

  getUserDoc(id: any) {
    return this.afs.collection('user').doc(id).valueChanges();
  }

  forgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then((res) => {
        window.alert('Password reset email sent, check your inbox');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
}

// return userRef.set(userData, {
//   merge: true,
// });
