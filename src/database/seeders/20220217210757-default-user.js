"use strict";
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { encrypt } = require("../../utils/crypto");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userId = await queryInterface.rawSelect(
      "users",
      { where: {}, limit: 1 },
      ["id"]
    );

    if (!userId) {
      return queryInterface.bulkInsert("users", [
        {
          fullName: "SAMYR SALDARRIAGA",
          email: "samyrsaldarriaga@gmail.com",
          password: bcrypt.hashSync("admin"),
          avatar:
            "https://lh3.googleusercontent.com/a-/AOh14Gg74MwlfwqTrbvILPzuJCHZrt-skiGcIF5qFmhU2tc=s432-p-rw-no",
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", null, {});
  },
};
