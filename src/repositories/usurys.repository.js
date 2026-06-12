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
    throw error;
  }
};

module.exports = {
  getUsurys,
  createUsury,
  getDefaultUsurys,
  getUsurysBySearch
};
