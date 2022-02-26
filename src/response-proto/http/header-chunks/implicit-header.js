export default function implicitHeader() {
  if (!this._headers) {
    this.status(this.statusCode);
  }
}
