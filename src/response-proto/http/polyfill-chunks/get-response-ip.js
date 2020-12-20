/** global: Buffer */

export default function getIP() {
  // Detect self
  const _self = this.send ? this : this.__response;

  return Buffer.from(_self.getRemoteAddress()).join('.');
}
