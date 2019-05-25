import { ws } from '../wrappers';

export default (fn) => {
  return (req, res) => {
    fn(ws.request(req), res);
  };
};
