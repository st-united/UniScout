import { Input, theme } from 'antd';
import axios from 'axios';
import React from 'react';

import CountrySelect from './CountrySelect';
import FileUpload from './FileUpload';
import { ORANGE, TabKey, MAX_FRONTEND_FILE_SIZE } from './helpers/connectWithUsHelpers';
import { useConnectWithUsForm } from './hooks/useConnectWithUsForm';
import { useFileUpload } from './hooks/useFileUpload';

/** underline AntD input (border bottom only). */
function UnderlineInput(props: {
  id?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (v: string) => void;
  type?: React.HTMLInputTypeAttribute;
  describedById?: string;
}) {
  const { token } = theme.useToken();
  const { id, value, placeholder, error, onChange, type, describedById } = props;
  return (
    <>
      <Input
        id={id}
        variant='borderless'
        bordered={false}
        size='large'
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        allowClear
        className='!px-3 !bg-transparent !shadow-none placeholder:!text-[#9CA3AF]'
        style={{
          border: 0,
          borderBottom: `2px solid ${error ? token.colorError : token.colorPrimary}`,
          borderRadius: 0,
          fontFamily: token.fontFamily,
          color: 'inherit',
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? describedById : undefined}
      />
      {error && (
        <p id={describedById} className='text-sm mt-1' style={{ color: token.colorError }}>
          {error}
        </p>
      )}
    </>
  );
}

type Props = { activeTab: TabKey };

export default function ConnectWithUsForm({ activeTab }: Props) {
  const f = useConnectWithUsForm();

  // Single-file upload (subjects) — still used in "New University"
  const subjects = useFileUpload({ multiple: false, maxFiles: 1, maxSize: MAX_FRONTEND_FILE_SIZE });

  // sync hook state with form state (subjects <-> newUniData.subjectsFile)
  React.useEffect(() => {
    if (f.newUniData.subjectsFile) subjects.setFiles([f.newUniData.subjectsFile]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return activeTab === 'new' ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (subjects.files[0]) {
          f.setNewUniData((p) => ({ ...p, subjectsFile: subjects.files[0] }));
        }
        f.submitNew();
      }}
      noValidate
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-x-12 lg:gap-x-24'>
        {/* Row 1 */}
        <div>
          <label
            htmlFor='new-universityName'
            className='block mb-1 text-sm font-medium text-[#FF7012]'
          >
            University Name*
          </label>
          <UnderlineInput
            id='new-universityName'
            value={f.newUniData.universityName}
            placeholder='Enter your university name'
            error={f.newUniErrors.universityName}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, universityName: v }));
              f.setNewUniErrors((p) => ({ ...p, universityName: undefined }));
            }}
          />
        </div>
        <div>
          <label
            htmlFor='new-abbreviation'
            className='block mb-1 text-sm font-medium text-[#FF7012]'
          >
            Abbreviation
          </label>
          <UnderlineInput
            id='new-abbreviation'
            value={f.newUniData.abbreviation}
            placeholder='Enter abbreviation (optional)'
            onChange={(v) => f.setNewUniData((p) => ({ ...p, abbreviation: v }))}
          />
        </div>

        {/* Row 2 */}
        <div>
          <label htmlFor='new-country' className='block mb-1 text-sm font-medium text-[#FF7012]'>
            Country*
          </label>
          <CountrySelect
            id='new-country'
            value={f.newUniData.country}
            options={f.countryOptions}
            placeholder='Select your country'
            error={f.newUniErrors.country}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, country: v }));
              f.setNewUniErrors((p) => ({ ...p, country: undefined }));
            }}
          />
        </div>
        <div>
          <label htmlFor='new-location' className='block mb-1 text-sm font-medium text-[#FF7012]'>
            Location*
          </label>
          <UnderlineInput
            id='new-location'
            value={f.newUniData.location}
            placeholder='Enter your location'
            error={f.newUniErrors.location}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, location: v }));
              f.setNewUniErrors((p) => ({ ...p, location: undefined }));
            }}
          />
        </div>

        {/* Row 3 */}
        <div>
          <label htmlFor='new-email' className='block mb-1 text-sm font-medium text-[#FF7012]'>
            Email*
          </label>
          <UnderlineInput
            id='new-email'
            value={f.newUniData.email}
            placeholder='Enter your email'
            error={f.newUniErrors.email}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, email: v }));
              f.setNewUniErrors((p) => ({ ...p, email: undefined }));
            }}
            type='email'
          />
        </div>
        <div>
          <label htmlFor='new-phone' className='block mb-1 text-sm font-medium text-[#FF7012]'>
            Phone*
          </label>
          <UnderlineInput
            id='new-phone'
            value={f.newUniData.phone}
            placeholder='Enter your phone'
            error={f.newUniErrors.phone}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, phone: v }));
              f.setNewUniErrors((p) => ({ ...p, phone: undefined }));
            }}
            type='text'
          />
        </div>

        {/* Row 4 */}
        <div>
          <label htmlFor='new-website' className='block mb-1 text-sm font-medium text-[#FF7012]'>
            Website*
          </label>
          <UnderlineInput
            id='new-website'
            value={f.newUniData.website}
            placeholder='Enter your website'
            error={f.newUniErrors.website}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, website: v }));
              f.setNewUniErrors((p) => ({ ...p, website: undefined }));
            }}
          />
        </div>
        <div>
          <label htmlFor='new-type' className='block mb-1 text-sm font-medium text-[#FF7012]'>
            Type*
          </label>
          <CountrySelect
            id='new-type'
            value={f.newUniData.type}
            options={f.typeOptions}
            placeholder='Select your type'
            error={f.newUniErrors.type}
            onChange={(v) => {
              f.setNewUniData((p) => ({ ...p, type: v }));
              f.setNewUniErrors((p) => ({ ...p, type: undefined }));
            }}
          />
        </div>

        {/* Row 5 */}
        <div>
          <label
            htmlFor='new-numberOfStudents'
            className='block mb-1 text-sm font-medium text-[#FF7012]'
          >
            Number of students
          </label>
          <UnderlineInput
            id='new-numberOfStudents'
            value={f.newUniData.studentPopulation}
            placeholder='Enter number of students'
            error={f.newUniErrors.studentPopulation}
            onChange={(v) => {
              const safe = v.replace(/[eE]/g, '');
              f.setNewUniData((p) => ({ ...p, studentPopulation: safe }));
              f.setNewUniErrors((p) => ({ ...p, studentPopulation: undefined }));
            }}
            type='number'
          />
        </div>
        <div className='hidden md:block' />

        {/* Description */}
        <div className='md:col-span-2'>
          <label
            htmlFor='new-description'
            className='block mb-1 text-sm font-medium text-[#FF7012]'
          >
            Description
          </label>
          <Input.TextArea
            id='new-description'
            value={f.newUniData.description}
            onChange={(e) => f.setNewUniData((p) => ({ ...p, description: e.target.value }))}
            placeholder='Enter description about your university'
            allowClear
            autoSize={{ minRows: 4, maxRows: 10 }}
            className='placeholder:!text-[#9CA3AF] !pt-2'
            style={{
              border: `2px solid ${ORANGE}`,
              borderRadius: 12,
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            }}
          />
        </div>
      </div>

      {/* Subjects */}
      <div className='mt-8 space-y-2'>
        <div className='text-lg font-semibold text-[#FF7012]'>Subjects</div>
        <p className='text-sm text-[#9CA3AF]'>
          Please download this Excel file to fill in the subjects, then upload the completed file.
        </p>

        <FileUpload
          title=''
          description=''
          accept='.xls,.xlsx'
          multiple={false}
          files={subjects.files}
          onFiles={subjects.addFiles}
          onRemove={(n) => {
            subjects.removeFile(n);
            f.setNewUniData((p) => ({ ...p, subjectsFile: null }));
          }}
          isDragging={subjects.isDragging}
          onDragOver={subjects.onDragOver}
          onDragLeave={subjects.onDragLeave}
          onDrop={subjects.onDrop}
          download={{
            label: 'Example.xls',
            sizeLabel: '1.00MB',
            onClick: async () => {
              const res = await axios.get('/contact/template/Subjects_Template.xlsx', {
                responseType: 'blob',
              });
              const blob = new Blob([res.data]);
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'Example.xls';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            },
          }}
        />
      </div>

      <div className='flex justify-end mt-8'>
        <button
          type='submit'
          className='px-10 py-3 font-medium border-none text-white rounded-full shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105'
          disabled={f.submissionStatus === 'submitting'}
        >
          {f.submissionStatus === 'submitting' ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        f.submitUpdate();
      }}
      noValidate
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
        <div>
          <label
            htmlFor='update-representativeName'
            className='block mb-2 text-sm font-medium text-[#FF7012]'
          >
            Representative Name*
          </label>
          <UnderlineInput
            id='update-representativeName'
            value={f.updateData.representativeName}
            placeholder='Enter your representative name'
            error={f.updateErrors.representativeName}
            onChange={(v) => {
              f.setUpdateData((p) => ({ ...p, representativeName: v }));
              f.setUpdateErrors((p) => ({ ...p, representativeName: undefined }));
            }}
          />
        </div>
        <div>
          <label
            htmlFor='update-universityName'
            className='block mb-2 text-sm font-medium text-[#FF7012]'
          >
            University Name*
          </label>
          <UnderlineInput
            id='update-universityName'
            value={f.updateData.universityName}
            placeholder='Enter your university name'
            error={f.updateErrors.universityName}
            onChange={(v) => {
              f.setUpdateData((p) => ({ ...p, universityName: v }));
              f.setUpdateErrors((p) => ({ ...p, universityName: undefined }));
            }}
          />
        </div>
        <div>
          <label htmlFor='update-email' className='block mb-2 text-sm font-medium text-[#FF7012]'>
            Email*
          </label>
          <UnderlineInput
            id='update-email'
            value={f.updateData.email}
            placeholder='Enter your email'
            error={f.updateErrors.email}
            onChange={(v) => {
              f.setUpdateData((p) => ({ ...p, email: v }));
              f.setUpdateErrors((p) => ({ ...p, email: undefined }));
            }}
            type='email'
          />
        </div>
        <div>
          <label htmlFor='update-phone' className='block mb-2 text-sm font-medium text-[#FF7012]'>
            Phone*
          </label>
          <UnderlineInput
            id='update-phone'
            value={f.updateData.phone}
            placeholder='Enter your phone'
            error={f.updateErrors.phone}
            onChange={(v) => {
              f.setUpdateData((p) => ({ ...p, phone: v }));
              f.setUpdateErrors((p) => ({ ...p, phone: undefined }));
            }}
            type='text'
          />
        </div>

        <div className='md:col-span-2'>
          <label htmlFor='update-message' className='block mb-2 text-sm font-medium text-[#FF7012]'>
            Your message*
          </label>
          <Input.TextArea
            id='update-message'
            value={f.updateData.message}
            onChange={(e) => f.setUpdateData((p) => ({ ...p, message: e.target.value }))}
            placeholder='Type your message here'
            allowClear
            autoSize={{ minRows: 4, maxRows: 10 }}
            className='placeholder:!text-[#9CA3AF] !pt-2'
            style={{
              border: `2px solid ${ORANGE}`,
              borderRadius: 12,
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            }}
          />
        </div>

        <div className='md:col-span-2 flex justify-end'>
          <button
            type='submit'
            className='px-10 py-3 font-medium text-white rounded-full border-none shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105'
            disabled={f.submissionStatus === 'submitting'}
          >
            {f.submissionStatus === 'submitting' ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  );
}
