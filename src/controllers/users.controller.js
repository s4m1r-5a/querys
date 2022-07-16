const { User, Role } = require("../models/index");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
} = require("../repositories/users.repository");

const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports.getUsers = async (req, res) => {
  const users = await getUsers();
  return res.json(users);
};

module.exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await getUserById(userId);
  res.status(200).json(user);
};

module.exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const newUser = req.body;
  const result = await updateUser(userId, newUser);
  res.json(result);
  /* const { oldPassword, newPassword } = req.body;
  const { userId } = req.params;

  if (oldPassword) {
    let userFound = await User.findById(userId);
    if (!userFound) return res.status(400).json({ message: "User Not Found" });

    const matchPassword = await User.comparePassword(
      oldPassword,
      userFound.password
    );

    if (!matchPassword)
      return res.status(401).json({ message: "Invalid Password" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: await User.encryptPassword(newPassword) },
      { new: true }
    );

    const token = jwt.sign({ id: updatedUser._id }, config.SECRET, {
      expiresIn: 86400, // 24 hours
    });
    return res.status(204).json({ token });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    req.body,
    { new: true }
  );
  res.status(204).json(updatedUser); */
};

module.exports.createUser = async (req, res) => {
  const newUser = req.body;
  const result = await createUser(newUser);
  console.log("resulto ", result);
  res.json(result);
};

module.exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  await User.findByIdAndDelete(userId);

  // code 200 is ok too
  res.status(204).json();
};
