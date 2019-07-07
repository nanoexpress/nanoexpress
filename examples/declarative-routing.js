const nanoexpress = require('..');

const app = nanoexpress();

app.define({
  '/': {
    get: async () => ({ route: 'get /' }),
    '/sub1': {
      get: async () => ({ route: 'get /sub1/' }),
      '/:id': {
        '/verify': {
          get: async (req) => ({
            route: 'get /sub1/' + req.params.id + '/verify'
          }),
          post: async (req) => ({
            route: 'post /sub1/' + req.params.id + '/verify'
          })
        }
      }
    },
    '/ext-sub': {
      get: async () => ({ route: 'direct get /ext-sub/' })
    }
  }
});

app.listen(4000);
