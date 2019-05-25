import querystring from 'query-string';

export default (req) => {
  return querystring.parse(req.getQuery());
};
