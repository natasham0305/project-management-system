"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("projects", "manager_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("projects", {
      fields: ["manager_id"],
      type: "foreign key",
      name: "projects_manager_id_fkey",
      references: {
        table: "Users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "projects",
      "projects_manager_id_fkey",
    );

    await queryInterface.removeColumn("projects", "manager_id");
  },
};
