import Events from '@dalisoft/events';

const proto = Events.prototype;

export default (ws) => {
  ws.on = proto.on;
  ws.once = proto.once;
  ws.off = proto.off;
  ws.emit = proto.emit;

  ws.___events = [];

  return ws;
};
