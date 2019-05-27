import { parse } from 'querystring';

export default (req, queries = {}) => {
  const query = req.getQuery();

  if (query.indexOf('?') === -1) {
    return queries;
  }
  if (query.length < 4) {
    return queries;
  }
  return Object.assign(queries, parse(query.substr(1)));
};
