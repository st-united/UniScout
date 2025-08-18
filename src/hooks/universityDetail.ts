import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fieldConfigs, type FieldConfig } from '../constants/universityDetail';
import { fetchFieldSubjects } from './../utils/universityDetail';
import { University as UniversityBase } from '@app/interface/university.interface';

export interface University extends UniversityBase {
  academicFieldsCommaSeparated?: string;
  subjectsList?: string;
  abbreviation?: string;
}

export const useUniversityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [readyFields, setReadyFields] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  useEffect(() => {
    axios.get(`/universities/${id}`).then((r) => setUniversity(r.data));
  }, [id]);

  const fieldKeys = useMemo(
    () =>
      (university?.academicFieldsCommaSeparated || '')
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    [university?.academicFieldsCommaSeparated],
  );

  const mappedFields = useMemo(
    () => fieldKeys.map((k) => fieldConfigs[k]).filter(Boolean) as FieldConfig[],
    [fieldKeys],
  );

  useEffect(() => {
    const run = async () => {
      if (!university?.subjectsList) return;
      const results = await Promise.all(
        mappedFields.map(async (f) => {
          try {
            const list = await fetchFieldSubjects(f.academicFieldId, university.subjectsList || '');
            return list.length ? f.apiFieldName : null;
          } catch {
            return null;
          }
        }),
      );
      setReadyFields(results.filter(Boolean) as string[]);
    };
    run();
  }, [mappedFields, university?.subjectsList]);

  return { university, fieldKeys, mappedFields, readyFields };
};
