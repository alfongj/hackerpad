"use strict";

// TODO Checks for whether browser is compatible
// TODO on sign ouot clear crypto key
// TODO encrypt/decrypt notes
// TODO add firebase json files for hosting and rules
// TODO link to static versions of all dependencies to prevent passwd from
//      being stolen
// TODO Add tab to search https://stackoverflow.com/questions/21605933/add-a-custom-search-engine-via-javascript
//      https://www.chromium.org/tab-to-search

(function() {
  const SIGNED_OUT_FAVICON_URL = 'img/ic_warning_black_24dp_2x.png';
  const SIGNED_IN_FAVICON_URL = 'img/ic_verified_user_black_24dp_2x.png';

  const l = console.log;

  // Runs fn once 'delay' ms have happened since the last continuous call to fn
  // (where two calls are continuous if ran in less than 'delay' ms)
  // TODO: Move next two functions into utils file
  const debounce = function(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  };

  const changeFavicon = function(src) {
    src = src+'?=' + Math.random();
    var link = document.createElement('link'),
    oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.href = src;
    if (oldLink) {
      document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
  };

  const signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth()
        .signInWithPopup(provider)
        .then(function(result) {
          l("D: Signed in")
        })
        .catch(function(error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      l(`E: Something went wrong :( [${errorCode}]:[${errorMessage}]`);
    });
  };

  // TODO: clean up...
  const main = function() {
    // DOM references
    const pad = document.getElementById('pad');
    const padTitleInputText = document.getElementById('pad-title');

    // Set title
    let padTitle;
    if (location.pathname && location.pathname.length > 1) {
      padTitle = decodeURI(location.pathname.substr(1));
    } else { // Default to today's date in YYYY-MM-DD format
      let date = new Date();
      let dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                          .toISOString()
                          .split("T")[0];
      padTitle = dateString;
      history.replaceState(null, '', dateString);
    }
    padTitleInputText.value = padTitle;

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    db.enablePersistence().catch(function(err) {
      if (err.code == 'failed-precondition') {
        l('W: Can\'t enable local persistence, probably due to having multiple tabs open');
      } else if (err.code == 'unimplemented') {
        l('W: This browser doesn\'t support local persistence');
      }
    });

    l("D: Firebase app initialized");

    // Check for authentication state changes
    firebase.auth().onAuthStateChanged(function(user) {
      l(`D: Auth state changed to user signed in: ${!!user}`);
      if (user) { // User is signed in.
        changeFavicon(SIGNED_IN_FAVICON_URL);

        const userNotes = db.collection(`users/${user.uid}/notes`);

        // TODO figure out where to move this
        // listNotes(userNotes);

        let note = userNotes.doc(encodeURI(padTitle));
        l(`D: Operating on note ${note.id}`);

        note.onSnapshot(function(snapshot) {
          var oldNoteContent = pad.innerHTML;
          var newNoteContent = snapshot.get('content');
          if (oldNoteContent != newNoteContent) {
            pad.innerHTML = newNoteContent ? newNoteContent : '';
          }
        }, function (errorObject) {
          l('E: The read failed: ' + errorObject.code);
        });

        const debouncedNoteSave = debounce(function() {
          l(`D: Updating note ${note.id}`);
          note.set({content: pad.innerHTML}, {merge: true});
        }, 1000);

        ['input', 'keyup', 'paste'].forEach( event => {
          pad.addEventListener(event, debouncedNoteSave, false);
        });

        pad.focus();
      } else {
        changeFavicon(SIGNED_OUT_FAVICON_URL);
        signInWithGoogle();
      }
    });
  };

  main();
})();
