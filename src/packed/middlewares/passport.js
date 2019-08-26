import passportHttpRequest from 'passport/lib/http/request';
import passport from 'passport';

export default (config) => {
  const initialize = passport.initialize(config);
  return (req, res, next) => {
    Object.assign(req, passportHttpRequest);
    initialize(req, res, next);
  };
};
