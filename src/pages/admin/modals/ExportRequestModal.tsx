import { FileExcelOutlined, FileTextOutlined, CloseOutlined } from '@ant-design/icons';
import { Modal, Button, Checkbox, Tag, message, ConfigProvider } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface ExportRequestModalProps {
  open: boolean;
  onClose: () => void;
  appliedFilters: Record<string, string[]>;
  sortBy?: string;
  sortOrder?: string;
}

// Interface for user request data
interface UserRequest {
  id: string;
  requestType: string;
  country: string;
  universityName: string;
  abbreviation?: string;
  status: 'Pending' | 'In Progress' | 'Rejected' | 'Completed';
  submittedAt: string;
  description?: string;
  representativeName?: string;
  representativeEmail?: string;
  representativeNumber?: string;
  message?: string;
  type?: string;
  universityEmail?: string;
  universityNumber?: string;
  website?: string;
  subjectsExcelFilePath?: string;
  numberOfStudents?: number;
  rejectionReason?: string;
}

// API Response interface
interface ApiResponse {
  data: UserRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const allColumns = [
  'ID',
  'Request Type',
  'Country',
  'University Name',
  'Abbreviation',
  'Status',
  'Submitted At',
  'Description',
  'Representative Name',
  'Representative Email',
  'Representative Number',
  'Message',
  'Type',
  'University Email',
  'University Number',
  'Website',
  'Number of Students',
  'Rejection Reason',
];

const API_BASE_URL = 'https://api.uniscout.dev.stunited.vn/api';

const ExportRequestModal: React.FC<ExportRequestModalProps> = ({
  open,
  onClose,
  appliedFilters,
  sortBy = '',
  sortOrder = '',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('excel');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(allColumns);
  const [isExporting, setIsExporting] = useState(false);

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

  // Function to fetch all pages of data
  const fetchAllData = async (): Promise<UserRequest[]> => {
    const allData: UserRequest[] = [];
    let currentPage = 1;
    let hasMorePages = true;
    const pageSize = 100; // Use larger page size to reduce API calls

    const safeFilters = sanitizeFilters(appliedFilters);

    while (hasMorePages) {
      try {
        const requestParams: Record<string, any> = {
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          sortBy: 'submittedAt',
          sortOrder: sortOrder || 'DESC',
        };

        // Add filters
        if (safeFilters.requestType && safeFilters.requestType.length > 0) {
          requestParams.requestType = safeFilters.requestType;
        }
        if (safeFilters.country && safeFilters.country.length > 0) {
          requestParams.country = safeFilters.country;
        }
        if (safeFilters.status && safeFilters.status.length > 0) {
          requestParams.status = safeFilters.status;
        }
        if (safeFilters.search && safeFilters.search.length > 0 && safeFilters.search[0].trim()) {
          requestParams.search = safeFilters.search[0].trim();
        }

        const response = await axios.get(`${API_BASE_URL}/admin/contact`, {
          params: requestParams,
          headers: {
            accept: '*/*',
          },
          paramsSerializer: (params) => {
            const searchParams = new URLSearchParams();
            Object.keys(params).forEach((key) => {
              const value = params[key];
              if (Array.isArray(value)) {
                value.forEach((item) => searchParams.append(key, item));
              } else if (value !== undefined) {
                searchParams.append(key, value);
              }
            });
            return searchParams.toString();
          },
        });

        if (response.data && response.data.data) {
          const apiData: ApiResponse = response.data;
          allData.push(...apiData.data);

          // Check if there are more pages
          hasMorePages = currentPage < apiData.totalPages;
          currentPage++;

          // Show progress message
          message.info(
            `Fetched page ${currentPage - 1} of ${apiData.totalPages} (${allData.length} records)`,
          );
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        console.error('Error fetching data for export:', error);
        message.error(`Failed to fetch page ${currentPage}`);
        hasMorePages = false;
      }
    }

    return allData;
  };

  // Function to convert data to CSV format
  const convertToCSV = (data: UserRequest[], columns: string[]): string => {
    const columnMap: Record<string, string> = {
      ID: 'id',
      'Request Type': 'requestType',
      Country: 'country',
      'University Name': 'universityName',
      Abbreviation: 'abbreviation',
      Status: 'status',
      'Submitted At': 'submittedAt',
      Description: 'description',
      'Representative Name': 'representativeName',
      'Representative Email': 'representativeEmail',
      'Representative Number': 'representativeNumber',
      Message: 'message',
      Type: 'type',
      'University Email': 'universityEmail',
      'University Number': 'universityNumber',
      Website: 'website',
      'Number of Students': 'numberOfStudents',
      'Rejection Reason': 'rejectionReason',
    };

    // Create header row
    const headerRow = columns.join(',');

    // Create data rows
    const dataRows = data.map((row) => {
      return columns
        .map((col) => {
          const fieldName = columnMap[col];
          const value = row[fieldName as keyof UserRequest];

          // Handle null/undefined values
          if (value === null || value === undefined) {
            return '';
          }

          // Escape commas and quotes in CSV
          const stringValue = String(value);
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }

          return stringValue;
        })
        .join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  };

  // Function to convert data to Excel format (XLSX)
  const convertToExcel = (data: UserRequest[], columns: string[]): Blob => {
    const columnMap: Record<string, string> = {
      ID: 'id',
      'Request Type': 'requestType',
      Country: 'country',
      'University Name': 'universityName',
      Abbreviation: 'abbreviation',
      Status: 'status',
      'Submitted At': 'submittedAt',
      Description: 'description',
      'Representative Name': 'representativeName',
      'Representative Email': 'representativeEmail',
      'Representative Number': 'representativeNumber',
      Message: 'message',
      Type: 'type',
      'University Email': 'universityEmail',
      'University Number': 'universityNumber',
      Website: 'website',
      'Number of Students': 'numberOfStudents',
      'Rejection Reason': 'rejectionReason',
    };

    // Prepare data for Excel
    const excelData = data.map((row) => {
      const rowData: Record<string, any> = {};
      columns.forEach((col) => {
        const fieldName = columnMap[col];
        rowData[col] = row[fieldName as keyof UserRequest] || '';
      });
      return rowData;
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');

    // Generate Excel file as buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert buffer to blob
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return blob;
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      message.warning('Please select at least one column to export');
      return;
    }

    setIsExporting(true);
    message.loading('Fetching all data for export...', 0);

    try {
      // Fetch all data from all pages
      const allData = await fetchAllData();

      if (allData.length === 0) {
        message.destroy();
        message.warning('No data found to export');
        setIsExporting(false);
        return;
      }

      message.destroy();
      message.success(`Successfully fetched ${allData.length} records`);

      let blob: Blob;
      let filename: string;

      if (selectedFormat === 'csv') {
        const csvContent = convertToCSV(allData, selectedColumns);
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `requests_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        blob = convertToExcel(allData, selectedColumns);
        filename = `requests_${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      // Clean up
      window.URL.revokeObjectURL(link.href);

      message.success(`Export successful! Downloaded ${allData.length} records`);
      onClose();
    } catch (error) {
      message.destroy();
      console.error('Export error:', error);
      message.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
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
          Export Request Data
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
                  {sortBy}
                </Tag>
              )}
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

          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FE7743',
              },
            }}
          >
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
          </ConfigProvider>
        </div>

        <div className='flex justify-end gap-3'>
          <Button
            type='default'
            onClick={onClose}
            disabled={isExporting}
            className='!border-[#d1d5db] !hover:border-[#d1d5db] !text-[#4b5563]'
          >
            Cancel
          </Button>
          <Button
            type='primary'
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting}
            className='!bg-[#FE7743] border-[#ff7a00] text-white !hover:bg-[#FE7743]'
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportRequestModal;
