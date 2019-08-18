import { parse } from 'querystring';

export default (req) => {
  const query = req.getQuery();

  let queries;
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
