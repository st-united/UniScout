// src/hooks/contact.ts
// Hooks for the Contact feature (API submit + generic file upload)

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import {
  NewUniState,
  UpdateState,
  UNIVERSITY_TYPES,
  mapCountryForApi,
  MAX_FRONTEND_FILE_SIZE,
  MAX_FRONTEND_FILES,
} from '../constants/contact';
import {
  openNotificationWithIcon,
  NotificationTypeEnum,
} from '@app/services/notification/notificationService';

// -------- useConnectWithUsForm ------------------------------------------------

export function useConnectWithUsForm() {
  // Countries for selects
  const [countries, setCountries] = useState<string[]>([]);
  const countryOptions = useMemo(() => countries.map((c) => ({ label: c, value: c })), [countries]);
  const typeOptions = useMemo(
    () => UNIVERSITY_TYPES.map((t) => ({ label: t.label, value: t.value })),
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/universities/countries');
        setCountries(res?.data?.data ?? []);
      } catch {
        setCountries([]);
      }
    })();
  }, []);

  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'success' | 'error' | 'submitting'
  >('idle');

  // Submit: New University
  const submitNew = async (values: NewUniState & { subjects?: File[] }) => {
    setSubmissionStatus('submitting');
    try {
      const fd = new FormData();
      fd.append('representativeNumber', '');
      fd.append('representativeName', '');
      fd.append('requestType', 'New University');
      fd.append('universityEmail', values.email);
      fd.append('representativeEmail', values.email);
      fd.append('abbreviation', values.abbreviation || '');

      const file = values.subjects?.[0];
      if (file) fd.append('subjectsExcel', file);

      fd.append('location', values.location);
      fd.append('country', mapCountryForApi(values.country));
      fd.append('files', 'string');
      fd.append('universityNumber', values.phone);

      const n = parseInt(values.studentPopulation, 10);
      fd.append('numberOfStudents', Number.isNaN(n) ? '0' : String(n));

      fd.append('universityName', values.universityName);
      fd.append('type', (values.type || '').toLowerCase());
      fd.append('website', values.website);
      fd.append('description', values.description || '');
      fd.append('representativeEmail', '');

      await axios.post('/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSubmissionStatus('success');
      openNotificationWithIcon(NotificationTypeEnum.SUCCESS, 'University submitted successfully!');
    } catch (err: any) {
      setSubmissionStatus('error');
      const msg = err?.response?.data?.message ?? 'Unknown error';
      openNotificationWithIcon(NotificationTypeEnum.ERROR, `Submission failed: ${msg}`);
    }
  };

  // Submit: Update Information
  const submitUpdate = async (values: UpdateState) => {
    setSubmissionStatus('submitting');
    try {
      const fd = new FormData();
      fd.append('representativeNumber', values.phone || '');
      fd.append('message', values.message || '');
      fd.append('representativeName', values.representativeName || '');
      fd.append('requestType', 'Update Information');
      fd.append('universityEmail', '');
      fd.append('abbreviation', '');
      fd.append('subjectsExcel', '');
      fd.append('location', '');
      fd.append('country', '');
      fd.append('files', '');
      fd.append('universityNumber', '');
      fd.append('numberOfStudents', '');
      fd.append('universityName', values.universityName || '');
      fd.append('type', '');
      fd.append('website', '');
      fd.append('description', '');
      fd.append('representativeEmail', values.email || '');
      for (const f of values.attachment || []) fd.append('attachments', f);

      await axios.post('/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSubmissionStatus('success');
      openNotificationWithIcon(NotificationTypeEnum.SUCCESS, 'Message sent successfully!');
    } catch {
      setSubmissionStatus('error');
      openNotificationWithIcon(NotificationTypeEnum.ERROR, 'Submission failed.');
    }
  };

  return {
    countries,
    countryOptions,
    typeOptions,
    submissionStatus,
    setSubmissionStatus,
    submitNew,
    submitUpdate,
  };
}

// -------- useFileUpload ------------------------------------------------------

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
