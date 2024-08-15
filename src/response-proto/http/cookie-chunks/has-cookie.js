export default function hasCookie(name) {
  return !!this.$cookies && this.$cookies[name] !== undefined;
}
