const generateKey = function(password, uid) {
  const encoder = new TextEncoder('utf-8');
  const encPassword = encoder.encode(password);
  const encSalt = encoder.encode(uid);

  crypto.subtle.importKey('raw', encPassword, 'PBKDF2', false, ['deriveBits'])
    .then(function(baseKey) {
      return crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'sha-256'
        },
          baseKey,
          128);
    }).then(function(result) {
      l('Hash is derived!');
      derivedHash = result;
      // TODO: persist in local storage
  });
};

const encryptContent = function(plainText) {
  // TODO if key not in memory, then read from localstorage & import
  // crypto.subtle.importKey('raw', keyBuf, {name: 'AES-CBC'}, true, ['encrypt', 'decrypt']).then(function (result) {
  //   that.encryptionKey = result;
  // })

  // Assume aesKey are imported/generated before, and the same plain text is used.
  var aesGcmParams = {
    name: "aes-gcm",
    // TODO pick an iv based on https://crypto.stackexchange.com/questions/42411/how-to-choose-the-size-of-the-iv-in-aes-gcm
    iv: asciiToUint8Array("jnOw99oOZFLIEPMr")
  }

  // Encryption:
  crypto.subtle.encrypt(aesGcmParams, key, plainText).then(function(result) {
      console.log("Plain text is encrypted.");
      cipherText = result; // It contains both the cipherText and the authentication data.
  });

  // TODO move this to decrypt functions
  // Decryption:
  crypto.subtle.decrypt(aesGcmParams, key, cipherText).then(function(result) {
      console.log("Cipher text is decrypted.");
      decryptedText = result;
  }, function(error) {
      // If any violation of the cipher text is detected, the operation will be rejected.
      // Error handling codes ...
  });
};
