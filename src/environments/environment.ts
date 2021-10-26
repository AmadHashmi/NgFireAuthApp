// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  useEmulator: false,

  firebase: {
    apiKey: 'AIzaSyCDpuFFtX6sKIEWHtGB07F-9rZe0YNIto0',
    authDomain: 'ngfireauthapp.firebaseapp.com',
    projectId: 'ngfireauthapp',
    storageBucket: 'ngfireauthapp.appspot.com',
    messagingSenderId: '489694417258',
    appId: '1:489694417258:web:b70af6888fd4632a029513',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
