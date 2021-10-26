import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// Firebase
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import firebase from 'firebase/compat/app';
import {
  AngularFireAuthModule,
  USE_EMULATOR as AUTH_EMULATOR,
} from '@angular/fire/compat/auth';

import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import {
  AngularFirestoreModule,
  USE_EMULATOR as FIRESTORE_EMULATOR,
  SETTINGS as FIRESTORE_SETTINGS,
} from '@angular/fire/compat/firestore';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import { VerifyemailComponent } from './components/verifyemail/verifyemail.component';
import { AuthService } from './shared/services/auth.service';

import {
  AngularFireStorageModule,
  AngularFireStorageReference,
  AngularFireUploadTask,
  AngularFireStorage,
  USE_EMULATOR as STORAGE_EMULATOR,
} from '@angular/fire/compat/storage';
import { FirebaseApp } from '@angular/fire/app';
import { initializeApp } from '@firebase/app';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SigninComponent,
    SignupComponent,
    ForgotpasswordComponent,
    VerifyemailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule,
  ],

  providers: [
    AuthService,

    {
      provide: AUTH_EMULATOR,
      useValue: environment.useEmulator
        ? ['http://localhost:9099', 9099]
        : undefined,
    },
    {
      provide: FIRESTORE_SETTINGS,
      useValue: environment.useEmulator
        ? { host: 'localhost:8080', ssl: false }
        : undefined,
    },
    // {
    //   provide: FIRESTORE_EMULATOR,
    //   useValue: environment.useEmulator
    //     ? ['localhost:8080', 8080]
    //     : undefined,
    // },
    {
      provide: STORAGE_EMULATOR,
      useValue: environment.useEmulator ? ['localhost', 9199] : undefined,
    },
    // {
    //   provide: STORAGE_EMULATOR,
    //   useValue: environment.useEmulator
    //     ? { host: 'localhost:9199', ssl: false st}
    //     : undefined,
    // },
    // {
    //   provide: AngularFireStorage,
    //   useValue: environment.useEmulator ? ['http://localhost:9199'] : undefined,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {}
}
