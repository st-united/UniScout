// SubjectsModal.tsx
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';

import { type FieldConfig } from '../../../constants/universityDetail';
import { fetchFieldSubjects } from '../../../utils/universityDetail';

const SubjectsModal: React.FC<{
  field: FieldConfig;
  open: boolean;
  onClose: () => void;
  universitySubjects: string;
}> = ({ field, open, onClose, universitySubjects }) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !field) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFieldSubjects(field.academicFieldId, universitySubjects);
        if (mounted) setSubjects(data);
      } catch {
        if (mounted) setError('Failed to load subjects');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, field?.academicFieldId, universitySubjects]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={553}
      className='subjects-modal'
      bodyStyle={{ paddingTop: 12 }}
      styles={{
        content: { borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,.08)' },
        header: { borderBottom: 'none', padding: 20 },
        body: { maxHeight: 520, overflowY: 'auto', padding: 20, background: '#FFFFFF' },
      }}
      title={
        <div className='text-center'>
          <h2 className='text-[32px] font-extrabold text-orange-500 mb-1'>{field.name}</h2>
          <p className='text-sm' style={{ color: '#787878' }}>
            Information about the fields of study related to <b>&apos;{field.name}&apos;</b>
          </p>
          <div
            className='mx-auto mt-3 rounded-full'
            style={{ width: 237, height: 2, background: '#F97316' }}
          />
        </div>
      }
    >
      <div className='pb-2 mb-2' style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className='grid grid-cols-4 gap-4 text-sm font-medium' style={{ color: '#4B5563' }}>
          <div className='text-center'>Number</div>
          <div className='col-span-3'>Field of Study</div>
        </div>
      </div>

      {loading && (
        <div className='text-center py-8' style={{ color: '#787878' }}>
          Loading subjects...
        </div>
      )}
      {!loading && error && (
        <div className='text-center py-8' style={{ color: '#EF4444' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className='max-h-96 overflow-y-auto'>
          {subjects.length ? (
            subjects.map((s, i) => (
              <div
                key={`${s}-${i}`}
                className='grid grid-cols-4 gap-4 py-3'
                style={{ borderBottom: '1px solid #EFEFEF' }}
              >
                <div className='text-sm text-center' style={{ color: '#6B7280' }}>
                  {i + 1}
                </div>
                <div className='col-span-3 text-sm' style={{ color: '#374151' }}>
                  {s}
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-10' style={{ color: '#787878' }}>
              No subjects found for this field.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default SubjectsModal;
