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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  userData: any;
  newUserData: any;
  constructor(
    public storage: AngularFireStorage,
    public db: AngularFireDatabaseModule,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    public afs: AngularFirestore // public storageRef: AngularFireStorageReference, // public storageTask: AngularFireUploadTask
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);

        this.getUserDoc(this.userData!.uid).subscribe((res) => {
          console.log(res);
          this.userData = res;
          this.router.navigate(['dashboard']);
        });
      } else {
        localStorage.setItem('user', null!);
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }

  SignIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerification !== false ? true : false;
  }

  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        if (this.afs.collection('user').doc(result.user?.uid)) {
          this.router.navigate(['dashboard']);
        } else {
          this.SetUserData(result.user);
          this.ngZone.run(() => {
            this.router.navigate(['dashboard']);
          });
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
    return this.AuthLogin(new firebase.auth.FacebookAuthProvider())
      .then(() => {
        this.ngZone.run(() => {
          // console.log(result);
          this.router.navigate(['dashboard']);
        });
      })
      .catch((error) => {
        window.alert(error);
      });
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
            };

            userRef.update(userData);
            console.log(this.fb);
            console.log('Printed' + this.userData.uid);
            console.log(userId);

            // userData.photoURL = this.fb;
          });
        })
      )
      .subscribe((url) => {
        if (url) {
          console.log('added!!!');
        }
      });
  }

  getUserDoc(id: any) {
    return this.afs.collection('user').doc(id).valueChanges();
  }

  openImageUpload() {
    console.log('clicked!');
  }
}

// return userRef.set(userData, {
//   merge: true,
// });
