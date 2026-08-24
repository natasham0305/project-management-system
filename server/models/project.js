"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Project.hasMany(models.Task, {
        foreignKey: "project_id",
        onDelete: "CASCADE",
      });

      Project.belongsTo(models.User, {
        foreignKey: "manager_id",
        as: "manager",
      });

      Project.belongsToMany(models.User, {
        through: "project_members",
        foreignKey: "project_id",
        otherKey: "user_id",
        as: "members",
      });
    }
  }
  Project.init(
    {
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Project",
      tableName: "projects",
      timestamps: false,
    },
  );
  return Project;
};
