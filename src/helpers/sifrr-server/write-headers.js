export default function writeHeaders(res, headers, other) {
  if (typeof other !== 'undefined') {
    res.writeHeader(headers, other.toString());
  } else {
    for (const header in headers) {
      res.writeHeader(header, headers[header].toString());
    }
  }
}
