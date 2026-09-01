"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Task, {
        foreignKey: "assigned_to",
        as: "assignedTasks",
      });

      User.hasMany(models.Project, {
        foreignKey: "manager_id",
        as: "managedProjects",
      });

      User.belongsToMany(models.Project, {
        through: "project_members",
        foreignKey: "user_id",
        otherKey: "project_id",
        as: "projects",
      });

      User.hasMany(models.ProjectMessage, {
        foreignKey: "sender_id",
        as: "sentMessages",
        onDelete: "CASCADE",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "member",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    },
  );
  return User;
};
