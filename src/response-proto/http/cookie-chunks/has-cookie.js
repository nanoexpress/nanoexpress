export default function hasCookie(name) {
  const req = this.__request;
  return !!req && !!req.cookies && req.cookies[name] !== undefined;
}
