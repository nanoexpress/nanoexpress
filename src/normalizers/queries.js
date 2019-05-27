import { parse } from 'querystring';

export default (req, queries = {}) => {
  const query = req.getQuery();
  if (query.length < 2) {
    return queries;
  }
  return Object.assign(queries, parse(query.substr(1)));
};
