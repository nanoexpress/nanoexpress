import { parse } from 'querystring';

export default ({
  json = true,
  experimentalJsonParse = false,
  urlEncoded = true
} = {}) => {
  const middleware = async (req, { fastBodyParse }) => {
    const { headers, body } = req;

    if (headers && body) {
      const contentType = headers['content-type'];
      if (contentType) {
        if (json && contentType.indexOf('/json') !== -1) {
          console.log(
            experimentalJsonParse,
            fastBodyParse,
            {
              check: experimentalJsonParse && fastBodyParse
            },
            body
          );
          if (experimentalJsonParse && fastBodyParse !== undefined) {
            console.log('BODY', { body, fast: fastBodyParse(body) });
            req.body = fastBodyParse(body);
          } else {
            req.body = JSON.parse(body);
          }
        } else if (
          urlEncoded &&
          contentType.indexOf('/x-www-form-urlencoded') !== -1
        ) {
          if (typeof urlEncoded === 'object') {
            req.body = parse(body, urlEncoded);
          } else {
            req.body = parse(body);
          }
        }
      }
    }
  };
  middleware.methods = 'POST, PUT, DELETE';

  return middleware;
};
