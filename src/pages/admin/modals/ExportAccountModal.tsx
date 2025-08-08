import { CloseOutlined } from '@ant-design/icons';
import { Modal, Button, Checkbox, Tag, message, ConfigProvider } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';

interface ExportAccountModalProps {
  open: boolean;
  onClose: () => void;
  appliedFilters: Record<string, string[]>;
}

const allColumns = ['Name', 'Department', 'Email', 'Create Time', 'Status'];

const ExportAccountModal: React.FC<ExportAccountModalProps> = ({
  open,
  onClose,
  appliedFilters,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(allColumns);

  const sanitizeFilters = (filters: Record<string, any>) => {
    const cleaned: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        const cleanedValues = value
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
          .filter((v) => v !== '');
        if (cleanedValues.length > 0) cleaned[key] = cleanedValues;
      }
    }
    return cleaned;
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      message.warning('Please select at least one column to export');
      return;
    }

    const columnMap: Record<string, string> = {
      Name: 'name',
      Department: 'job',
      Email: 'email',
      'Create Time': 'createdAt',
      Status: 'status',
    };

    const mappedColumns = selectedColumns.map((col) => columnMap[col]).filter(Boolean);
    const safeFilters = sanitizeFilters(appliedFilters);

    const ALLOWED_STATUS = new Set(['active', 'inactive', 'pending', 'blocked']);
    const ALLOWED_ROLES = new Set(['admin', 'user', 'super']);
    const JOB_CANON: Record<string, string> = {
      marketing: 'Marketing',
      'business development': 'Business Development',
    };

    const statusArr = (safeFilters.status ?? [])
      .map((s) => s.toLowerCase())
      .filter((s) => ALLOWED_STATUS.has(s));
    const statusPayload: string | undefined = statusArr[0];

    const roleArr = (safeFilters.role ?? [])
      .map((r) => r.toLowerCase())
      .filter((r) => ALLOWED_ROLES.has(r));
    const rolePayload = roleArr.length ? roleArr : undefined;

    const jobArrLower = (safeFilters.job ?? [])
      .map((j) => j.toLowerCase())
      .filter((j) => JOB_CANON[j]);
    const jobPayload = jobArrLower.length ? jobArrLower.map((j) => JOB_CANON[j]) : undefined;

    const payload = {
      fields: mappedColumns,
      status: statusPayload,
      role: rolePayload,
      job: jobPayload,
      search: safeFilters.search?.[0] || '',
      format: selectedFormat === 'excel' ? 'xlsx' : 'csv',
    };

    try {
      const response = await axios.post('/users/export', payload, {
        responseType: 'blob',
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';

      if (selectedFormat === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const reverseColumnMap: Record<string, string> = {};
            for (const [label, key] of Object.entries(columnMap)) {
              if (selectedColumns.includes(label)) reverseColumnMap[key] = label;
            }

            const lines = text.split(/\r?\n/);
            if (lines.length > 0) {
              const headers = lines[0].split(',').map((h) => h.trim());
              const remappedHeaders = headers.map((h) => reverseColumnMap[h] || h);
              lines[0] = remappedHeaders.join(',');
            }

            const formatted = lines
              .join('\n')
              .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, (match) => {
                const d = new Date(match);
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
                  d.getHours(),
                )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
              });

            const blob = new Blob([formatted], { type: contentType });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
            link.download = `account-data-${dateStr}.csv`;
            link.click();
            message.success('Export successful');
            onClose();
          }
        };
        reader.readAsText(response.data);
      } else {
        const blob = new Blob([response.data], { type: contentType });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        link.download = `account-data-${dateStr}.xlsx`;
        link.click();
        message.success('Export successful');
        onClose();
      }
    } catch {
      message.error('Export failed');
    }
  };

  const formatButton = (type: 'excel' | 'csv', iconSrc: string, label: string) => {
    const isActive = selectedFormat === type;
    const baseClasses =
      'flex-1 h-12 font-medium rounded-lg border text-sm flex items-center justify-center gap-2 px-4';
    const activeClasses = '!bg-[#fffaeb] !border-[#ff7a00] !text-[#ff7a00]';
    const inactiveClasses = 'bg-white !border-[#d1d5db] !hover:border-[#d1d5db] !text-[#4b5563]';
    const hoverOverride = '!hover:bg-[#fffaeb] !hover:border-[#ff7a00] !hover:text-[#ff7a00]';

    return (
      <Button
        type='default'
        onClick={() => setSelectedFormat(type)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${hoverOverride}`}
      >
        <div className='flex items-center justify-center gap-2'>
          <img src={iconSrc} alt={`${label} Logo`} className='w-6 h-6' />
          <span>{label}</span>
        </div>
      </Button>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FE7743',
        },
      }}
    >
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closeIcon={<CloseOutlined className='text-gray-400' />}
        width={640}
        title={
          <h2 className='text-2xl font-semibold text-center text-[#FE7743] mb-2'>
            Export Account Data
          </h2>
        }
      >
        <div className='p-3'>
          {Object.values(appliedFilters).some((arr) => arr.length > 0) && (
            <div className='mb-4 border border-solid border-[#e5e7eb] rounded-lg p-4'>
              <p className='font-bold mb-1 text-[#FE7743]'>Apply Filter</p>
              <p className='text-gray-500 mb-3'>
                Only data matching the selected filters will be exported
              </p>
              <div className='flex flex-wrap gap-2'>
                {(() => {
                  const seen = new Set<string>();
                  const tags: React.ReactElement[] = [];

                  const merged: Record<string, string[]> = { ...appliedFilters };
                  if (appliedFilters.job && appliedFilters.role) {
                    merged.job = Array.from(
                      new Set([...appliedFilters.job, ...appliedFilters.role]),
                    );
                    delete merged.role;
                  }

                  for (const [key, values] of Object.entries(merged)) {
                    for (const rawVal of values) {
                      const val = rawVal?.trim();
                      const k = `${key}:${val?.toLowerCase()}`;
                      if (val && !seen.has(k)) {
                        seen.add(k);
                        const label =
                          key === 'job' ? 'Department' : key.charAt(0).toUpperCase() + key.slice(1);
                        tags.push(
                          <Tag
                            key={k}
                            className='bg-[#fff7e6] border-[#ffc069] text-[#fa8c16] font-medium rounded-full px-3 py-1'
                          >
                            {`${label}: ${val}`}
                          </Tag>,
                        );
                      }
                    }
                  }

                  return tags;
                })()}
              </div>
            </div>
          )}

          <div className='mb-4 border border-solid border-[#e5e7eb] rounded-lg p-4'>
            <p className='font-bold text-[#FE7743] mb-3'>Format</p>
            <div className='flex gap-4 justify-center items-center'>
              {formatButton('excel', './src/assets/images/excel-logo.png', 'Excel')}
              {formatButton('csv', './src/assets/images/csv-logo.png', 'CSV')}
            </div>
          </div>

          <div className='mb-4 border border-solid border-[#e5e7eb] rounded-lg p-4'>
            <p className='font-bold text-[#FE7743] mb-3'>Select column to export</p>
            <Checkbox.Group
              value={selectedColumns}
              onChange={(checked) => setSelectedColumns(checked as string[])}
            >
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
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
            <Button type='primary' onClick={handleExport} className='bg-[#FE7743] border-[#ff7a00]'>
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ExportAccountModal;
