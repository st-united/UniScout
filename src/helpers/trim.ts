export const trim = (obj: any) => {
  const trimmed = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string') {
      return value.replace(/ +(?= )/g, '').trim();
    }
    return value;
  });
  return JSON.parse(trimmed);
};
