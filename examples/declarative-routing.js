const nanoexpress = require('../build/nanoexpress');

const app = nanoexpress();

app.get('/', () => '{"hello":"world"}');

app.define({
  '/': {
    get: () => ({ route: 'get /' }),
    '/sub1': {
      get: () => ({ route: 'get /sub1/' }),
      '/:id': {
        '/verify': {
          get: (req) => ({ route: 'get /sub1/' + req.params.id + '/verify' }),
          post: (req) => ({ route: 'post /sub1/' + req.params.id + '/verify' })
        }
      }
    }
  },
  '/ext-sub': {
    get: () => ({ route: 'direct get /ext-sub/' })
  }
});

app.listen(4000);
