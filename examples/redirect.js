import nanoexpress from '../src/nanoexpress.js';

const app = nanoexpress();

app.get('/', (req, res) => res.redirect('/another'));
app.get('/google', (req, res) => res.redirect('https://google.com/'));
app.get('/another', async () => ({ redirected: true }));

app.listen(4000);
