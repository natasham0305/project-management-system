"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("project_members", {
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("project_members", {
      fields: ["project_id"],
      type: "foreign key",
      name: "project_members_project_id_fkey",
      references: {
        table: "Projects",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("project_members", {
      fields: ["user_id"],
      type: "foreign key",
      name: "project_members_user_id_fkey",
      references: {
        table: "Users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("project_members", {
      fields: ["project_id", "user_id"],
      type: "unique",
      name: "project_members_project_user_unique",
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "project_members",
      "project_members_project_id_fkey",
    );

    await queryInterface.removeConstraint(
      "project_members",
      "project_members_user_id_fkey",
    );

    await queryInterface.removeConstraint(
      "project_members",
      "project_members_project_user_unique",
    );

    await queryInterface.dropTable("project_members");

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
