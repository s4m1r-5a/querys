const { User } = require('../models/index');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/crypto');

const getUsersBySearch = searchObj => {
  return User.findOne({ where: searchObj });
};

const getUserByEmail = email => {
  return User.findOne({ where: { email } });
};

const getUsers = async id => {
  return await User.findAll();
};

const getUserById = async id => {
  return await User.findOne({ where: { id } });
};

const settingsCache = {};
const getDecryptedUsers = async id => {
  let setting = settingsCache[id];

  if (!setting) {
    setting = await getUserById(id);
    setting.secretKey = decrypt(setting.secretKey);
    settingsCache[id] = setting;
  }
  return setting;
};

const clearUsersCache = id => (settingsCache[id] = null);

const getDefaultUsers = async () => {
  const setting = await User.findOne();
  return getDecryptedUsers(setting.id);
};

const createUser = async newUser => {
  const { email } = newUser;
  newUser.password = bcrypt.hashSync(newUser.password);
  try {
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: newUser
    });

    return { user, created };
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const updateUser = async (userId, newUser) => {
  const cUser = await getUserById(userId);

  if (newUser.fullName && newUser.fullName !== cUser.fullName)
    cUser.fullName = newUser.fullName;

  if (newUser.email && newUser.email !== cUser.email)
    cUser.email = newUser.email;

  if (newUser.newPassword)
    cUser.password = bcrypt.hashSync(newUser.newPassword);

  if (newUser.avatar && newUser.avatar !== cUser.avatar)
    cUser.avatar = newUser.avatar;

  try {
    await cUser.save();
    return cUser;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }

  /* if (!newUser.secretKey) newUser.secretKey = cUser.secretKey;
  else if (newUser.secretKey) {
    newUser.secretKey = encrypt(newUser.secretKey);
    clearUsersCache(id);
  } */
};

module.exports = {
  getUserByEmail,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  getDecryptedUsers,
  getDefaultUsers,
  clearUsersCache,
  getUsersBySearch
};
