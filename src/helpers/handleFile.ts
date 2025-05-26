export const addToFormData = (filesData: object, regularData: object): FormData => {
  const formData = new FormData();
  Object.values(filesData)[0].map((file: string | Blob) => {
    formData.append(Object.keys(filesData)[0], file);
  });
  for (const [key, value] of Object.entries(regularData)) {
    formData.append(key, value);
  }
  return formData;
};
