export function strToBuf(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}
