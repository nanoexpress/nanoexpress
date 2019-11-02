export default function() {
  // Detect self
  const _self = this.send ? this : this.__response;

  return Buffer.from(_self.getRemoteAddress()).join('.');
}
