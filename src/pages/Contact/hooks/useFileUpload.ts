import { useState } from 'react';

import { MAX_FRONTEND_FILE_SIZE, MAX_FRONTEND_FILES } from '../helpers/connectWithUsHelpers';

type UseFileUploadOpts = {
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
};

export function useFileUpload(opts: UseFileUploadOpts = {}) {
  const multiple = opts.multiple ?? false;
  const maxFiles = opts.maxFiles ?? MAX_FRONTEND_FILES;
  const maxSize = opts.maxSize ?? MAX_FRONTEND_FILE_SIZE;

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const next: File[] = [...files];
    for (const f of arr) {
      if (f.size > maxSize) {
        setError(`${f.name}: File size > ${Math.round(maxSize / 1024 / 1024)}MB.`);
        continue;
      }
      if (!multiple && next.length >= 1) {
        next[0] = f;
        break;
      }
      if (multiple && next.length >= maxFiles) {
        setError(`Max ${maxFiles} files allowed.`);
        break;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const removeFile = (name: string) => setFiles((p) => p.filter((f) => f.name !== name));
  const clear = () => setFiles([]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return {
    files,
    setFiles,
    addFiles,
    removeFile,
    clear,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    error,
    setError,
  };
}
