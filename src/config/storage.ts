export const fromStoredData = (storageData: string) => {
  try {
    return JSON.parse(storageData);
  } catch (error) {
    console.error('Failed to parse stored data as JSON:', error, storageData);
    return null;
  }
};

export const toStoredData = (data: any) => JSON.stringify(data);

export const getStorageJSONData = (key: string): any => {
  const storedData = localStorage.getItem(key);
  return storedData ? fromStoredData(storedData) : null;
};

export const setStorageJSONData = (key: string, data: any) =>
  localStorage.setItem(key, toStoredData(data));

export const getStorageStringData = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const setStorageStringData = (key: string, data: string) => localStorage.setItem(key, data);

export const removeStorageData = (key: string) => localStorage.removeItem(key);
