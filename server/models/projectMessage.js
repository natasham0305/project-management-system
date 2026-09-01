"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProjectMessage extends Model {
    static associate(models) {
      ProjectMessage.belongsTo(models.Project, {
        foreignKey: "project_id",
        as: "project",
      });

      ProjectMessage.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "sender",
      });

      ProjectMessage.hasMany(models.MessageAttachment, {
        foreignKey: "message_id",
        as: "attachments",
        onDelete: "CASCADE",
      });
    }
  }

  ProjectMessage.init(
    {
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProjectMessage",
      tableName: "project_messages",
      timestamps: true,
      underscored: true,
    },
  );

  return ProjectMessage;
};
