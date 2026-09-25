"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Projects", "manager_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("Projects", {
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
      "Projects",
      "projects_manager_id_fkey",
    );

    await queryInterface.removeColumn("Projects", "manager_id");
  },
};
