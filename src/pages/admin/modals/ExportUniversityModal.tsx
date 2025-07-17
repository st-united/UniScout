import { FileExcelOutlined, FileTextOutlined, CloseOutlined } from '@ant-design/icons';
import { Modal, Button, Checkbox, Tag, message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

interface ExportUniversityModalProps {
  open: boolean;
  onClose: () => void;
  appliedFilters: Record<string, string[]>;
  sortBy?: string;
}

const allColumns = [
  'University Name',
  'Abbreviation',
  'Country',
  'Location',
  'Latitude',
  'Longitude',
  'Rank',
  'Website',
  'Email',
  'Phone',
  'Subjects',
  'Description',
  'Logo',
  'Type',
  'Number of students',
];

const ExportUniversityModal: React.FC<ExportUniversityModalProps> = ({
  open,
  onClose,
  appliedFilters,
  sortBy = '',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const hasActiveFilters =
    Object.values(appliedFilters).some(
      (arr) => Array.isArray(arr) && arr.some((val) => val?.trim() !== ''),
    ) ||
    (sortBy && sortBy.trim() !== '');

  const sanitizeFilters = (filters: Record<string, any>) => {
    const cleaned: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        const cleanedValues = value.filter((v) => v && v.trim && v.trim() !== '');
        if (cleanedValues.length > 0) {
          cleaned[key] = cleanedValues;
        }
      }
    }
    return cleaned;
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      message.warning('Please select at least one column to export');
      return;
    }

    try {
      const columnMap: Record<string, string> = {
        'University Name': 'university',
        Abbreviation: 'abbreviation',
        Country: 'country',
        Location: 'location',
        Latitude: 'latitude',
        Longitude: 'longitude',
        Rank: 'rank',
        Website: 'website',
        Email: 'email',
        Phone: 'phone',
        Subjects: 'subjects',
        Description: 'description',
        Logo: 'logo',
        Type: 'type',
        'Number of students': 'numberOfStudents',
      };

      const mappedColumns = selectedColumns.map((col) => columnMap[col]).filter(Boolean);
      const safeFilters = sanitizeFilters(appliedFilters);

      const params = {
        format: selectedFormat,
        columns: mappedColumns,
        ...safeFilters,
        ...(sortBy ? { sortBy } : {}),
      };

      const response = await axios.get('/admin/universities/export', {
        params,
        responseType: 'blob',
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => {
                if (v && v.trim() !== '') {
                  searchParams.append(key === 'columns' ? 'columns[]' : key, v);
                }
              });
            } else if (value !== undefined && value !== null) {
              searchParams.append(key, value);
            }
          });
          return searchParams.toString();
        },
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `universities.${selectedFormat === 'csv' ? 'csv' : 'xlsx'}`;
      link.click();

      message.success('Export successful');
      onClose();
    } catch (error) {
      message.error('Export failed');
    }
  };

  const formatButton = (type: 'excel' | 'csv', icon: React.ReactNode, label: string) => {
    const isActive = selectedFormat === type;
    return (
      <Button
        type={isActive ? 'primary' : 'default'}
        icon={icon}
        onClick={() => setSelectedFormat(type)}
        className={`flex-1 h-12 font-medium ${
          isActive ? 'bg-[#fffaeb] border-[#ff7a00] text-[#ff7a00]' : ''
        }`}
      >
        {label}
      </Button>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      closeIcon={<CloseOutlined className='text-gray-400' />}
      style={{ top: 45 }}
      bodyStyle={{ padding: 0, borderRadius: 24, backgroundColor: '#fff' }}
    >
      <div className='p-3'>
        <h2 className='text-2xl font-semibold text-center text-[#FE7743] mb-2'>
          Export University Data
        </h2>

        {hasActiveFilters && (
          <div className='mb-4 border border-solid border-[#e5e7eb] rounded-lg p-4'>
            <p className='font-bold mb-1 text-[#FE7743]'>Apply Filter</p>
            <p className='text-gray-500 mb-3'>
              Only data matching the selected filters will be exported
            </p>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(appliedFilters).flatMap(([key, values]) =>
                values
                  .filter((val) => val?.trim())
                  .map((val) => (
                    <Tag
                      key={`${key}-${val}`}
                      className='bg-[#fff7e6] border-[#ffc069] text-[#fa8c16] font-medium rounded-full px-3 py-1'
                    >
                      {val}
                    </Tag>
                  )),
              )}
              {sortBy && (
                <Tag className='bg-[#fff7e6] border-[#ffc069] text-[#fa8c16] font-medium rounded-full px-3 py-1'>
                  Sort by: {sortBy}
                </Tag>
              )}
            </div>
          </div>
        )}

        <div className='mb-4 border border-solid border-[#e5e7eb] rounded-lg p-4'>
          <p className='font-bold text-[#FE7743] mb-3'>Format</p>
          <div className='flex gap-4'>
            {formatButton('excel', <FileExcelOutlined />, 'Excel')}
            {formatButton('csv', <FileTextOutlined />, 'CSV')}
          </div>
        </div>

        <div className='mb-4 border border-solid border-[#e5e7eb] rounded-lg p-4'>
          <p className='font-bold text-[#FE7743] mb-3'>Select column to export</p>
          <Checkbox.Group
            value={selectedColumns}
            onChange={(checked) => setSelectedColumns(checked as string[])}
          >
            <div className='grid grid-cols-3 gap-2'>
              {allColumns.map((col) => (
                <Checkbox key={col} value={col}>
                  {col}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </div>

        <div className='flex justify-end gap-3'>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type='primary'
            onClick={handleExport}
            className='!bg-[#FE7743] border-[#ff7a00] text-white !hover:bg-[#FE7743]'
          >
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportUniversityModal;
