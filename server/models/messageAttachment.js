"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MessageAttachment extends Model {
    static associate(models) {
      MessageAttachment.belongsTo(models.ProjectMessage, {
        foreignKey: "message_id",
        as: "message",
      });
    }
  }

  MessageAttachment.init(
    {
      message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      file_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "MessageAttachment",
      tableName: "message_attachments",
      timestamps: true,
      underscored: true,
    },
  );

  return MessageAttachment;
};
