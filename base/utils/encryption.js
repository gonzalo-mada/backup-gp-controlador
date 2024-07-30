"use strict";

var crypto = require("crypto");

let encrypt = (text) => {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(
        global.config.param_base_crypter_algorithm,
        new Buffer.from(global.config.param_base_crypter_password_iv),
        iv
    );
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("base64") + "_" + encrypted.toString("base64");
};

let decrypt = (text) => {
    let textParts = text.split("_");
    let iv = new Buffer.from(textParts.shift(), "base64");
    let encryptedText = new Buffer.from(textParts.join("_"), "base64");
    let decipher = crypto.createDecipheriv(
        global.config.param_base_crypter_algorithm,
        new Buffer.from(global.config.param_base_crypter_password_iv),
        iv
    );
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
};

module.exports = {
    decrypt,
    encrypt,
};
