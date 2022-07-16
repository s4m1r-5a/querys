const { Usury } = require('../models/index');

const getUsurysBySearch = searchObj => {
  return Usury.findOne({ where: searchObj });
};

const getUsurys = async id => {
  return await Usury.findAll();
};

const getDefaultUsurys = async () => {
  const usury = await Usury.findOne();
  return usury;
};

const createUsury = async newUsury => {
  const { date } = newUsury;
  try {
    const [usury, created] = await Usury.findOrCreate({
      where: { date },
      defaults: newUsury
    });

    return { usury, created };
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

const updateUsury = async (userId, newUsury) => {
  const cUsury = await getUsuryById(userId);

  if (newUsury.fullName && newUsury.fullName !== cUsury.fullName)
    cUsury.fullName = newUsury.fullName;

  if (newUsury.email && newUsury.email !== cUsury.email)
    cUsury.email = newUsury.email;

  if (newUsury.avatar && newUsury.avatar !== cUsury.avatar)
    cUsury.avatar = newUsury.avatar;

  try {
    await cUsury.save();
    return cUsury;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }

  /* if (!newUsury.secretKey) newUsury.secretKey = cUsury.secretKey;
  else if (newUsury.secretKey) {
    newUsury.secretKey = encrypt(newUsury.secretKey);
    clearUsurysCache(id);
  } */
};

module.exports = {
  getUsurys,
  createUsury,
  updateUsury,
  getDefaultUsurys,
  getUsurysBySearch
};
