const sanitizeHtml = require("sanitize-html");

const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

const sanitizeBody = (fields) => {
  return (req, res, next) => {
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] = sanitizeText(req.body[field]);
      }
    });

    next();
  };
};

module.exports = sanitizeBody;
