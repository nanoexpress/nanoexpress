export default (wsEvents, ws) => {
  ws.___events = wsEvents.___events;
  ws.on = wsEvents.on;
  ws.once = wsEvents.once;
  ws.off = wsEvents.off;
  ws.emit = wsEvents.emit;

  return ws;
};
