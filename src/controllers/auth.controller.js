const { User } = require('../models/index');
// const { transpoter } = require('./mail.controller');
//const { OAuth2Client } = require('google-auth-library');
//const axios = require('axios');

const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcryptjs');
const {
  updateUser,
  createUser,
  getUserById,
  getUserByEmail
} = require('../repositories/users.repository');

const blacklist = [];
//const client = new OAuth2Client(config.AUTHGOOGLE.client_id);

module.exports.signUp = async (req, res) => {
  try {
    // Getting the Request Body
    const {
      username,
      email,
      password,
      business,
      roles,
      images,
      personalInfo,
      sales,
      userType,
      rank,
      rankHistory
    } = req.body;

    // Creating a new User Object
    const newUser = new User({
      username,
      email,
      password: await User.encryptPassword(password),
      roles,
      images,
      personalInfo,
      sales,
      userType,
      rank,
      rankHistory,
      business,
      sponsors
    });

    // checking for roles
    if (!roles) {
      newUser.roles = ['user'];
    }
    // checking for business
    if (business) {
      const foundCompanys = await Company.find({ nit: { $in: business } });
      newUser.business = foundCompanys.map(business => business._id);
    } else {
      return res
        .status(400)
        .json({ message: 'Compañia o negocio no encontrado' });
    }
    /* if (roles) {
                              const foundRoles = await Role.find({ name: { $in: roles } });
                              newUser.roles = foundRoles.map((role) => role._id);
                            } else {
                              const role = await Role.findOne({ name: "user" });
                              newUser.roles = [role._id];
                            } */

    // Saving the User Object in Mongodb
    const savedUser = await newUser.save();

    // Create a token
    const token = jwt.sign({ id: savedUser._id }, config.SECRET, {
      expiresIn: 86400 // 24 hours
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

module.exports.signin = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'User Not Found' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'User Not Found' });

  const token = jwt.sign({ id: user.id }, config.SECRET, {
    expiresIn: 86400 // 24 hours
  });

  res.json({
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
    token
  });
};

module.exports.logout = async (req, res) => {
  const token = req.headers['x-access-token'];
  blacklist.push(token);
  res.json({
    email: res.locals.email,
    fullName: res.locals.fullName,
    avatar: res.locals.avatar
  });
};

module.exports.whoami = async (req, res) => {
  res.status(200).json(req.logged);
};

module.exports.forgetPass = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ message: 'No se ha proporcionado ningún email' });

  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'User Not Found' });

  const token = jwt.sign({ id: user.id }, config.SECRET, {
    expiresIn: '30m'
  });

  const verificationLink = `http://localhost:3000/authentication/reset-password/${token}`;

  const data = {
    from: "'inmovili' <inmovily@gmail.com>",
    to: email,
    subject: 'Esto es una prueba de inmovili',
    text: verificationLink
  };

  /* transpoter
    .sendMail(data)
    .then(reslt => {
      console.log(reslt);
      res.status(200).json({ message: 'Envio de email exitoso' });
    })
    .catch(e => {
      if (e.response) console.log(e.response.data.message);
      else console.log(e.message);
      res
        .status(400)
        .json({ message: e.message ? e.message : e.response.data.message });
    }); */
};

module.exports.resetPass = async (req, res) => {
  const { newPassword } = req.body;
  const token = req.headers['token'];
  const isVal = blacklist.some(t => t === token);
  if (!token || !newPassword || isVal)
    return res
      .status(403)
      .json({ message: 'Hay algo mal en los datos proporcionados' });

  try {
    const decoded = jwt.verify(token, config.SECRET);
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Usuario invalido' });
    await updateUser(user.id, { newPassword });
    blacklist.push(token);
    res.status(200).json({ message: 'Cambio de contraseña exitoso' });
  } catch (error) {
    console.log('jwt expired');
    return res.status(401).json({ message: 'No autorizado!' });
  }
};

module.exports.isBlacklisted = async token => {
  return blacklist.some(t => t === token);
};

module.exports.token = async (req, res) => {
  const { trade, webhook } = req.body;
  // Create a token
  const token = jwt.sign({ trade, webhook }, config.SECRET, (err, token) => {
    if (err) return res.status(403).json({ message: 'Error al generar token' });
    res.status(200).json({ token });
  });
};
