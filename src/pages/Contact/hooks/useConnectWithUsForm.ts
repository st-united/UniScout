import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ErrorBag,
  NewUniState,
  UpdateState,
  UNIVERSITY_TYPES,
  mapCountryForApi,
  validateNewUni,
  validateUpdate,
} from '../helpers/connectWithUsHelpers';
import {
  openNotificationWithIcon,
  NotificationTypeEnum,
} from '@app/services/notification/notificationService';

export function useConnectWithUsForm() {
  // Shared
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

  // New University state
  const [newUniData, setNewUniData] = useState<NewUniState>({
    universityName: '',
    abbreviation: '',
    location: '',
    website: '',
    type: '',
    studentPopulation: '',
    description: '',
    country: '',
    email: '',
    phone: '',
    subjectsFile: null,
  });
  const [newUniErrors, setNewUniErrors] = useState<ErrorBag>({});
  const subjectsFileInputRef = useRef<HTMLInputElement>(null);

  // Update state
  const [updateData, setUpdateData] = useState<UpdateState>({
    representativeName: '',
    universityName: '',
    email: '',
    phone: '',
    message: '',
    attachment: [],
  });
  const [updateErrors, setUpdateErrors] = useState<ErrorBag>({});

  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'success' | 'error' | 'submitting'
  >('idle');

  const resetNewForm = () => {
    setNewUniData({
      universityName: '',
      abbreviation: '',
      location: '',
      website: '',
      type: '',
      studentPopulation: '',
      description: '',
      country: '',
      email: '',
      phone: '',
      subjectsFile: null,
    });
    setNewUniErrors({});
    if (subjectsFileInputRef.current) subjectsFileInputRef.current.value = '';
  };

  const resetUpdateForm = () => {
    setUpdateData({
      representativeName: '',
      universityName: '',
      email: '',
      phone: '',
      message: '',
      attachment: [],
    });
    setUpdateErrors({});
  };

  // Submits
  const submitNew = async () => {
    const errors = validateNewUni(newUniData);
    if (Object.keys(errors).length) {
      setNewUniErrors(errors);
      return;
    }
    setSubmissionStatus('submitting');
    try {
      const fd = new FormData();
      fd.append('representativeNumber', '');
      fd.append('representativeName', '');
      fd.append('requestType', 'New University');
      fd.append('universityEmail', newUniData.email);
      fd.append('abbreviation', newUniData.abbreviation);
      if (newUniData.subjectsFile) fd.append('subjectsExcel', newUniData.subjectsFile);
      fd.append('location', newUniData.location);
      fd.append('country', mapCountryForApi(newUniData.country));
      fd.append('files', 'string');
      fd.append('universityNumber', newUniData.phone);
      const n = parseInt(newUniData.studentPopulation, 10);
      fd.append('numberOfStudents', Number.isNaN(n) ? '0' : String(n));
      fd.append('universityName', newUniData.universityName);
      fd.append('type', newUniData.type.toLowerCase());
      fd.append('website', newUniData.website);
      fd.append('description', newUniData.description);
      fd.append('representativeEmail', '');

      await axios.post('/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSubmissionStatus('success');
      openNotificationWithIcon(NotificationTypeEnum.SUCCESS, 'University submitted successfully.');
      resetNewForm();
    } catch (err: any) {
      setSubmissionStatus('error');
      const msg = err?.response?.data?.message ?? 'Unknown error';
      openNotificationWithIcon(NotificationTypeEnum.ERROR, `Submission failed: ${msg}`);
    }
  };

  const submitUpdate = async () => {
    const errors = validateUpdate(updateData);
    if (Object.keys(errors).length) {
      setUpdateErrors(errors);
      return;
    }
    setSubmissionStatus('submitting');
    try {
      const fd = new FormData();
      fd.append('representativeNumber', updateData.phone || '');
      fd.append('message', updateData.message || '');
      fd.append('representativeName', updateData.representativeName || '');
      fd.append('requestType', 'Update Information');
      fd.append('universityEmail', '');
      fd.append('abbreviation', '');
      fd.append('subjectsExcel', '');
      fd.append('location', '');
      fd.append('country', '');
      fd.append('files', '');
      fd.append('universityNumber', '');
      fd.append('numberOfStudents', '');
      fd.append('universityName', updateData.universityName || '');
      fd.append('type', '');
      fd.append('website', '');
      fd.append('description', '');
      fd.append('representativeEmail', updateData.email || '');
      for (const f of updateData.attachment) fd.append('attachments', f);

      await axios.post('/contact', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSubmissionStatus('success');
      openNotificationWithIcon(NotificationTypeEnum.SUCCESS, 'Information updated successfully.');
      resetUpdateForm();
    } catch {
      setSubmissionStatus('error');
      openNotificationWithIcon(NotificationTypeEnum.ERROR, 'Submission failed.');
    }
  };

  return {
    // data
    countries,
    countryOptions,
    typeOptions,
    newUniData,
    setNewUniData,
    newUniErrors,
    setNewUniErrors,
    subjectsFileInputRef,
    updateData,
    setUpdateData,
    updateErrors,
    setUpdateErrors,
    submissionStatus,
    setSubmissionStatus,
    // actions
    submitNew,
    submitUpdate,
  };
}
