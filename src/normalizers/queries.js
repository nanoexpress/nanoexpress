import { parse } from 'querystring';

export default (req, queries) => {
  const query = req.getQuery();

  if (query.indexOf('?') === -1) {
    return queries;
  }
  if (query.length < 4) {
    return queries;
  }
  const parsedQueries = parse(query.substr(1));

  if (!queries) {
    queries = {};
  }

  for (const query in parsedQueries) {
    queries[query] = parsedQueries[query];
  }
  return queries;
};
