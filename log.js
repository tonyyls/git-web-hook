const log4js = require("log4js");
log4js.configure({
  appenders: { hook: { type: "file", filename: "hook.log" } },
  categories: { default: { appenders: ["hook"], level: "info" } }
});

module.exports = log4js.getLogger("hook");
