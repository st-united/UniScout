export const fromStoredData = (storageData: string) => JSON.parse(storageData);

export const toStoredData = (data: unknown) => JSON.stringify(data);

export const getStorageData = (key: string): unknown => {
  const storedData = localStorage.getItem(key);
  return storedData ? fromStoredData(storedData) : null;
};

export const setStorageData = (key: string, data: unknown) =>
  localStorage.setItem(key, toStoredData(data));

export const removeStorageData = (key: string) => localStorage.removeItem(key);
