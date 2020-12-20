/* eslint-disable import/no-unresolved, node/no-missing-import */
import expressGraphql from 'express-graphql';
import { buildSchema } from 'graphql';
import nanoexpress from '../src/nanoexpress.js';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => 'Hello world!'
};

const app = nanoexpress();

app.post(
  '/graphql',
  expressGraphql({
    schema,
    rootValue: root,
    graphiql: false
  })
);

app.get(
  '/graphql',
  expressGraphql({
    schema,
    rootValue: root,
    graphiql: true
  })
);

app.get('/', (req, res) => {
  res.end('go to /graphql');
});

app.listen(4000);
