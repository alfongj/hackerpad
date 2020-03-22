# hackerpad
Minimalist cloud backed notes app


# Test plan
- Signed out
- Revoke OAuth
- Token refresh after an hour
- Offline
- Get note by name
- Random note

# TODO
- Explain crypto. Functions used. Salt choice (why basically there wasn't another option)
- Explain chrome set up
- Explain why we use localstorage -> no other viable way of storing local secret
  We dl all JS to prevent dynamic code injection. We're still vulnerable to:
  1. hosting provider injecting modified js code. run your own hosting if you
    want to avoid
  2. Anyone with root access to your pc, or user access to your browser, can
    read it. It's up to you to protect your pc. This ain't the only thing that
    would get compromised in that case lol.

# Run and deploy
- Add file firebase-config.js to your js directory. Obtain the fields from the
  firebase console. The relevant fields are:
```
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  };
```
