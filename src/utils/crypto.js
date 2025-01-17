const aes = require("aes-js");
require('dotenv').config();

const key = aes.utils.utf8.toBytes(process.env.AES_KEY);
if (key.length !== 32)
  throw new Error("Invalid key for AES. Must be 256-bit / 32 bytes.");

const encrypt = (text) => {
  const bytesInfo = aes.utils.utf8.toBytes(text);
  const aesCTR = new aes.ModeOfOperation.ctr(key);
  const encryptedBytes = aesCTR.encrypt(bytesInfo);
  return aes.utils.hex.fromBytes(encryptedBytes);
};

const decrypt = (encryptedHex) => {
  const encryptedBytes = aes.utils.hex.toBytes(encryptedHex);
  const aesCTR = new aes.ModeOfOperation.ctr(key);
  const decryptedBytes = aesCTR.decrypt(encryptedBytes);
  return aes.utils.utf8.fromBytes(decryptedBytes);
};

module.exports = {
  encrypt,
  decrypt,
};
