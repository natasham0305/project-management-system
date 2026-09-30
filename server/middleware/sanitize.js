const sanitizeHtml = require("sanitize-html");

// 1. Core clean function (Modified to handle recursive tracking)
const sanitizeValue = (value) => {
  // If it's a string, sanitize it
  if (typeof value === "string") {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  // If it's an array, recursively sanitize every item inside it
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  // If it's a plain object (and not null), recursively sanitize all its properties
  if (typeof value === "object" && value !== null) {
    const sanitizedObj = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitizedObj[key] = sanitizeValue(value[key]);
      }
    }
    return sanitizedObj;
  }

  // If it's a number, boolean, etc., leave it completely untouched
  return value;
};

// 2. Middleware factory
const sanitizeBody = (fields) => {
  return (req, res, next) => {
    // If no specific fields are provided, automatically sanitize the ENTIRE body
    if (!fields || fields.length === 0) {
      req.body = sanitizeValue(req.body);
      return next();
    }

    // Otherwise, only sanitize the specific top-level fields requested
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] = sanitizeValue(req.body[field]);
      }
    });

    next();
  };
};

module.exports = sanitizeBody;
