import { CloudUploadOutlined } from '@ant-design/icons';
import { Download } from 'lucide-react';
import React, { useRef } from 'react';

type Props = {
  title?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: FileList | File[]) => void;
  onRemove: (name: string) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  download?: { label: string; sizeLabel?: string; onClick: () => void };
};

export default function FileUpload({
  title,
  description,
  accept,
  multiple,
  files,
  onFiles,
  onRemove,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  download,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className='space-y-3'>
      {title && <div className='text-lg font-semibold text-[#FF7012]'>{title}</div>}
      {description && <div className='text-sm text-[#787878]'>{description}</div>}

      {download && (
        <button
          type='button'
          onClick={download.onClick}
          className='mb-6 flex items-center justify-between w-full max-w-md border-1 border-solid border-[#E7E7E7] rounded-lg px-8 py-3 bg-white cursor-pointer hover:bg-gray transition-colors'
          title={download.label}
        >
          <div className='flex items-center'>
            <img src='./src/assets/images/excel-logo.svg' alt='Excel' className='w-10 h-10 mr-3' />
            <div className='flex flex-col items-start'>
              <span className='font-medium text-[#0B0B0B] text-base'>{download.label}</span>
              {download.sizeLabel && (
                <span className='text-xs text-[#6D6D6D]'>{download.sizeLabel}</span>
              )}
            </div>
          </div>
          <Download size={20} className='text-[#1D1B20]' />
        </button>
      )}
      <p className='text-sm text-[#9CA3AF]'>Please upload your completed file below:</p>
      <div
        className={`border-2 border-dashed border-[#FF7012] rounded-xl flex flex-col items-center justify-center bg-white ${
          isDragging ? 'bg-orange-50' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type='file'
          className='hidden'
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.currentTarget.value = '';
          }}
        />
        {files.length === 0 ? (
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='flex flex-col items-center w-full h-full p-6 !bg-transparent border-none cursor-pointer'
          >
            <CloudUploadOutlined
              style={{ fontSize: 40, color: '#f97316', marginBottom: '0.5rem' }}
            />
            <span className='text-[#6D6D6D]'>
              Drag your file or <span className='text-[#FF7012] underline'>browse</span>
            </span>
            <span className='text-xs text-[#787878] mt-1'>Max 5 MB files are allowed</span>
          </button>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {files.map((f) => (
              <span
                key={f.name}
                className='text-base text-gray-800 font-medium bg-orange-100 px-3 py-1 rounded-full flex items-center'
              >
                {f.name}
                <button
                  type='button'
                  onClick={() => onRemove(f.name)}
                  className='ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white border border-orange-300 text-orange-600 hover:bg-orange-100'
                  title='Remove file'
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
