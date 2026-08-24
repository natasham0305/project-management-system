"use strict";

const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash("Password123!", 10);

    const now = new Date();

    await queryInterface.bulkInsert("Users", [
      {
        username: "Admin User",
        email: "admin@example.com",
        password,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        username: "Manager User",
        email: "manager@example.com",
        password,
        role: "manager",
        createdAt: now,
        updatedAt: now,
      },
      {
        username: "Member User",
        email: "member@example.com",
        password,
        role: "member",
        createdAt: now,
        updatedAt: now,
      },
      {
        username: "Viewer User",
        email: "viewer@example.com",
        password,
        role: "viewer",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Users", {
      email: {
        [Op.in]: [
          "admin@example.com",
          "manager@example.com",
          "member@example.com",
          "viewer@example.com",
        ],
      },
    });
  },
};
