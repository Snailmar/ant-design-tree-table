/**
 * get uuid
 * @param length  length
 * @param join join char
 * @returns
 */
export function getUUID(length = 32, join = "", useNumber = true) {
  const withLine = true; //带不带横线
  const len = length; //长度为36
  let radix = 16; //16进制
  const chars = `${
    useNumber ? "0123456789" : ""
  }ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`.split("");
  // eslint-disable-next-line prefer-const
  let uuid = [],
    i;
  radix = radix || chars.length;
  if (withLine) {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = join;
    uuid[14] = "4";
    for (i = 0; i < len; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  } else {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | (Math.random() * radix)];
    }
  }
  return uuid.join("");
}
