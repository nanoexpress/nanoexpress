import { parse } from 'querystring';

export default async (req) => {
  const { headers, body } = req;

  const contentType = headers['content-type'];

  if (typeof body === 'string') {
    if (contentType) {
      if (contentType.includes('/json')) {
        req.body = JSON.parse(body);
      } else if (contentType.startsWith('application/x-www-form-urlencoded')) {
        req.body = parse(req.body);
      }
    }
  }
};
