import { parse } from 'querystring';

export default (req) => {
  return parse(req.getQuery().substr(1));
};
