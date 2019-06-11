import { parse } from 'querystring';

export default (req, queries) => {
  const query = req.getQuery();

  if (!query) {
    return queries;
  }
  const parsed = parse(query);

  for (const query in parsed) {
    // On-Demand attaching for memory reason
    if (!queries) {
      queries = {};
    }

    queries[query] = parsed[query];
  }
  return queries;
};
