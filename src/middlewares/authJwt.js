const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models/index');
const { isBlacklisted } = require('../controllers/auth.controller');
const { getUserById } = require('../repositories/users.repository');
const { notificacion, authNotified } = require('../utils/notifications');
//const Role = require("../models/Role");
//const Product = require("../models/Product");
//const { db } = require("../models/User");

module.exports.verifyToken = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  const isVal = await isBlacklisted(token);

  if (!token) return res.status(401).json({ message: 'Ningún token' });

  if (isVal) return res.status(401).json({ message: 'Token invalido' });

  try {
    const decoded = jwt.verify(token, config.SECRET);
    //const user = await User.findById(req.userId, { password: 0 }).populate("roles");
    //const user = await User.findById(decoded.id, { password: 0 });
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Usuario invalido' });
    console.log('token verificado');
    authNotified(user.id, {
      token,
      msg: 'token verificado confirmando por ws'
    });
    notificacion('Notificacion', 'este token se acaba de conectar: ' + token);
    res.locals = user;
    next();
  } catch (error) {
    console.log('jwt expired');
    return res.status(401).json({ message: 'No autorizado!' });
  }
};

module.exports.verifyTradeToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) return res.status(401).json({ message: 'Ningún token' });

  jwt.verify(token, config.SECRET, async (err, authData) => {
    if (err) return res.status(401).json({ message: 'Token invalido' });

    // const trade = await getUserById(authData.id);
    //if (!trade) return res.status(401).json({ message: 'Trade invalido' });
    res.trade = authData.trade;
    res.webhook = authData.webhook;
    next();
  });
};

module.exports.isModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('roles');
    //const roles = await Role.find({ _id: { $in: user.roles } });

    for (let i = 0; i < user.roles.length; i++) {
      if (user.roles[i].name === 'moderator') {
        next();
        return;
      }
    }

    return res.status(403).json({ message: 'Require Moderator Role!' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error });
  }
};

module.exports.isAdmin = async (req, res, next) => {
  try {
    //const user = await User.findById(req.userId).populate("roles");
    const user = await User.findById(req.userId);
    //const roles = await Role.find({ _id: { $in: user.roles } });

    for (let i = 0; i < user.roles.length; i++) {
      if (user.roles[i] === 'admin') {
        next();
        return;
      }
    }
    return res.status(403).json({ message: 'Require Admin Role!' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error });
  }
};
