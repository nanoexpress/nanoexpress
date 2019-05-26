export default (fn, ...args) =>
  new Promise((resolve, reject) => {
    fn(...args, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
