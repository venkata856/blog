const crypto = require("crypto");

const genHashFromPassword = (password) => {
  var salt = crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
};

const validatePassword = (password, salt, hash) => {
  var validHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return validHash == hash;
};

module.exports.genHashFromPassword = genHashFromPassword;
module.exports.validatePassword = validatePassword;
