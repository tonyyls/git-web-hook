"use strict";
const log4js = require("log4js");

log4js.configure({
  appenders: {
    hook: { type: "file", filename: "hook.log" },
    console: { type: "console" }
  },
  categories: { default: { appenders: ["hook", "console"], level: "info" } }
});

module.exports = log4js.getLogger("hook");
