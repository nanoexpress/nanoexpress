const passportHttpRequest = require('passport/lib/http/request');
const passport = require('passport');

module.exports = (config) => {
  const initialize = passport.initialize(config);
  return (req, res, next) => {
    Object.assign(req, passportHttpRequest);
    initialize(req, res, next);
  };
};
