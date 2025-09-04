import { Form, Input, theme, Button } from 'antd';
import axios from 'axios';
import { Asterisk } from 'lucide-react';
import React from 'react';

import CountrySelect from './CountrySelect';
import FileUpload from './FileUpload';
import {
  ORANGE,
  TabKey,
  MAX_FRONTEND_FILE_SIZE,
  NewUniState,
  UpdateState,
} from '../../constants/contact';
import { useConnectWithUsForm } from '../../hooks/contact';

const underlineStyle = (primary: string) => ({
  border: 0,
  borderBottom: `2px solid ${primary}`,
  borderRadius: 0,
  background: 'transparent',
});

const labelTextStyle: React.CSSProperties = { color: ORANGE, fontWeight: 500, fontSize: 15 };

/* ---------- Safe input helpers ---------- */
const navKeys = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab']);
const isMeta = (e: React.KeyboardEvent<HTMLInputElement>) => e.ctrlKey || e.metaKey;

// Digits only (0-9)
const onKeyDownDigits: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
  if (isMeta(e) || navKeys.has(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
};
const onPasteDigits: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
  const t = e.clipboardData.getData('text');
  if (!/^\d+$/.test(t)) e.preventDefault();
};

const onKeyDownPhone: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
  if (isMeta(e) || navKeys.has(e.key)) return;
  const input = e.currentTarget;
  if (e.key === '+') {
    const { selectionStart } = input;
    if (selectionStart !== 0 || input.value.includes('+')) e.preventDefault();
    return;
  }
  if (!/^\d$/.test(e.key)) e.preventDefault();
};
const onPastePhone: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
  const t = e.clipboardData.getData('text').replace(/[^\d+]/g, '');
  const plusCount = (t.match(/\+/g) || []).length;
  const plusAtStart = t.startsWith('+');
  if (plusCount > 1 || (plusCount === 1 && !plusAtStart)) e.preventDefault();
  if (!/^\+?\d*$/.test(t)) e.preventDefault();
};

// Gentle trimming
const trim = (v?: string) => (typeof v === 'string' ? v.trim() : v);

type Props = { activeTab: TabKey };

export default function ConnectWithUsForm({ activeTab }: Props) {
  const f = useConnectWithUsForm();
  const { token } = theme.useToken();

  const [newForm] = Form.useForm<NewUniState & { subjects?: File[] }>();
  const [updateForm] = Form.useForm<UpdateState>();

  const required = (msg: string) => [{ required: true, message: msg }];

  const emailRules = [
    { required: true, message: 'Required.' },
    { type: 'email' as const, message: 'Invalid email.' },
  ];

  const urlRules = [
    { required: true, message: 'Required.' },
    {
      validator: (_: any, v?: string) => {
        if (!v) return Promise.resolve();
        const ok = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(v.trim());
        return ok ? Promise.resolve() : Promise.reject(new Error('Invalid URL.'));
      },
    },
  ];

  const phoneRules = [
    { required: true, message: 'Required.' },
    { pattern: /^\+?\d+$/, message: 'Only numbers and +.' },
  ];

  const studentRules = [
    {
      validator: (_: any, value?: string) => {
        if (!value) return Promise.resolve();
        const n = Number(value);
        if (!Number.isFinite(n)) return Promise.reject(new Error('Must be a valid number.'));
        if (!Number.isInteger(n)) return Promise.reject(new Error('Must be an integer.'));
        if (n < 0) return Promise.reject(new Error('Cannot be negative.'));
        return Promise.resolve();
      },
    },
  ];

  const subjectsRules = [
    {
      validator: (_: any, files?: File[]) => {
        if (!files || files.length === 0) return Promise.resolve();
        if (files.length > 1) return Promise.reject(new Error('Max 1 file allowed.'));
        const f0 = files[0];
        if (f0.size > MAX_FRONTEND_FILE_SIZE) {
          const mb = Math.round(MAX_FRONTEND_FILE_SIZE / 1024 / 1024);
          return Promise.reject(new Error(`File size > ${mb}MB.`));
        }
        if (!/\.xlsx?$/i.test(f0.name)) {
          return Promise.reject(new Error('Only .xls or .xlsx allowed.'));
        }
        return Promise.resolve();
      },
    },
  ];

  const handleSubmitNew = async (values: NewUniState & { subjects?: File[] }) => {
    newForm.setFieldsValue({
      email: trim(values.email),
      website: trim(values.website),
      universityName: trim(values.universityName),
      location: trim(values.location),
      abbreviation: trim(values.abbreviation),
    });
    await f.submitNew({ ...values, email: trim(values.email) || '' });
    newForm.resetFields();
  };

  const handleSubmitUpdate = async (values: UpdateState) => {
    updateForm.setFieldsValue({
      email: trim(values.email),
      universityName: trim(values.universityName),
      representativeName: trim(values.representativeName),
      message: trim(values.message),
    });
    await f.submitUpdate({ ...values, email: trim(values.email) || '' });
    updateForm.resetFields();
  };

  // Upload component bound to the Form (single file)
  const SubjectsUpload = () => {
    const form = newForm;
    const files: File[] = Form.useWatch('subjects', form) || [];
    const [isDragging, setIsDragging] = React.useState(false);

    const setFiles = (next: File[]) => form.setFieldsValue({ subjects: next });
    const addFiles = (incoming: FileList | File[]) => {
      const first = Array.from(incoming)[0];
      setFiles(first ? [first] : []);
    };
    const removeFile = (name: string) => setFiles(files.filter((f) => f.name !== name));
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

    return (
      <>
        <FileUpload
          title=''
          description=''
          accept='.xls,.xlsx'
          multiple={false}
          files={files}
          onFiles={addFiles}
          onRemove={removeFile}
          isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
        <Form.Item name='subjects' rules={subjectsRules} hidden>
          <input type='hidden' />
        </Form.Item>
      </>
    );
  };

  // Compact vertical rhythm + aligned columns
  const itemMb = 14;
  const gridCls = 'grid grid-cols-1 md:grid-cols-2 items-start gap-y-2 md:gap-x-16 lg:gap-x-24';

  return activeTab === 'new' ? (
    <Form
      form={newForm}
      layout='vertical'
      onFinish={handleSubmitNew}
      validateTrigger={['onBlur', 'onSubmit']}
      className='connect-form'
      requiredMark={(label, { required }) => (
        <>
          {label}
          {required && (
            <Asterisk
              size={12}
              style={{ color: ORANGE, marginInlineStart: 4 }}
              aria-hidden='true'
            />
          )}
        </>
      )}
    >
      {/* attach the other form to avoid the "useForm instance not connected" warning */}
      <Form form={updateForm} component={false} />

      <div className={gridCls}>
        <Form.Item
          name='universityName'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>University Name</span>}
          style={{ marginBottom: itemMb }}
        >
          <Input
            variant='borderless'
            maxLength={120}
            size='large'
            placeholder='Enter your university name'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='organization'
          />
        </Form.Item>

        <Form.Item
          name='abbreviation'
          label={<span style={labelTextStyle}>Abbreviation</span>}
          style={{ marginBottom: itemMb }}
        >
          <Input
            variant='borderless'
            maxLength={15}
            size='large'
            placeholder='Enter abbreviation'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='off'
          />
        </Form.Item>

        <Form.Item
          name='country'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>Country</span>}
          style={{ marginBottom: itemMb }}
        >
          <CountrySelect options={f.countryOptions} placeholder='Select your country' />
        </Form.Item>

        <Form.Item
          name='location'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>Location</span>}
          style={{ marginBottom: itemMb }}
        >
          <Input
            variant='borderless'
            maxLength={80}
            size='large'
            placeholder='Enter your location'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='address-level2'
          />
        </Form.Item>

        <Form.Item
          name='email'
          required
          rules={emailRules}
          label={<span style={labelTextStyle}>Email</span>}
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input
            type='email'
            maxLength={80}
            inputMode='email'
            variant='borderless'
            size='large'
            placeholder='Enter your email'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='email'
          />
        </Form.Item>

        <Form.Item
          name='phone'
          required
          rules={phoneRules}
          label={<span style={labelTextStyle}>Phone</span>}
          style={{ marginBottom: itemMb }}
        >
          <Input
            variant='borderless'
            size='large'
            maxLength={13}
            placeholder='Enter your phone'
            style={underlineStyle(token.colorPrimary)}
            inputMode='tel'
            onKeyDown={onKeyDownPhone}
            onPaste={onPastePhone}
            allowClear
            autoComplete='tel'
          />
        </Form.Item>

        <Form.Item
          name='website'
          required
          rules={urlRules}
          label={<span style={labelTextStyle}>Website</span>}
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input
            variant='borderless'
            size='large'
            maxLength={80}
            placeholder='Enter your website'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='url'
          />
        </Form.Item>

        <Form.Item
          name='type'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>Type</span>}
          style={{ marginBottom: itemMb }}
        >
          <CountrySelect options={f.typeOptions} placeholder='Select your type' />
        </Form.Item>

        <Form.Item
          name='studentPopulation'
          rules={studentRules}
          label={<span style={labelTextStyle}>Number of students</span>}
          style={{ marginBottom: itemMb }}
        >
          <Input
            type='text'
            inputMode='numeric'
            pattern='\d*'
            variant='borderless'
            size='large'
            maxLength={10}
            placeholder='Enter number of students'
            style={underlineStyle(token.colorPrimary)}
            onKeyDown={onKeyDownDigits}
            onPaste={onPasteDigits}
            allowClear
            autoComplete='off'
          />
        </Form.Item>

        <div className='hidden md:block' />

        <Form.Item
          name='description'
          label={<span style={labelTextStyle}>Description</span>}
          className='md:col-span-2'
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input.TextArea
            placeholder='Enter description about your university'
            allowClear
            autoSize={{ minRows: 4, maxRows: 10 }}
            className='placeholder:!text-[#9CA3AF] !pt-2'
            style={{ border: `2px solid ${ORANGE}`, borderRadius: 12 }}
            autoComplete='off'
          />
        </Form.Item>
      </div>

      <div className='mt-4 space-y-2'>
        <div className='text-[15px]' style={{ color: ORANGE }}>
          Subjects
        </div>
        <p className='text-sm text-[#9CA3AF]'>
          Please download this Excel file to fill in the subjects, then upload the completed file.
        </p>
        <SubjectsUpload />
      </div>

      <div className='flex justify-end mt-4'>
        <Button
          htmlType='submit'
          type='primary'
          className='px-10 py-5 font-medium rounded-full shadow-md bg-gradient-to-r from-orange-400 to-orange-600 cursor-pointer hover:shadow-lg hover:scale-105'
          disabled={f.submissionStatus === 'submitting'}
          loading={f.submissionStatus === 'submitting'}
        >
          {f.submissionStatus === 'submitting' ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </Form>
  ) : (
    <Form
      form={updateForm}
      layout='vertical'
      onFinish={handleSubmitUpdate}
      validateTrigger={['onBlur', 'onSubmit']}
      className='connect-form'
      requiredMark={(label, { required }) => (
        <>
          {label}
          {required && (
            <Asterisk
              size={12}
              style={{ color: ORANGE, marginInlineStart: 4 }}
              aria-hidden='true'
            />
          )}
        </>
      )}
    >
      {/* attach the other form to avoid the "useForm instance not connected" warning */}
      <Form form={newForm} component={false} />

      <div className={gridCls}>
        <Form.Item
          name='representativeName'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>Representative Name</span>}
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input
            variant='borderless'
            size='large'
            placeholder='Enter your representative name'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='name'
          />
        </Form.Item>

        <Form.Item
          name='universityName'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>University Name</span>}
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input
            variant='borderless'
            size='large'
            placeholder='Enter your university name'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='organization'
          />
        </Form.Item>

        <Form.Item
          name='email'
          required
          rules={emailRules}
          label={<span style={labelTextStyle}>Email</span>}
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input
            type='email'
            inputMode='email'
            variant='borderless'
            size='large'
            placeholder='Enter your email'
            style={underlineStyle(token.colorPrimary)}
            allowClear
            autoComplete='email'
          />
        </Form.Item>

        <Form.Item
          name='phone'
          required
          rules={phoneRules}
          label={<span style={labelTextStyle}>Phone</span>}
          style={{ marginBottom: itemMb }}
        >
          <Input
            variant='borderless'
            size='large'
            placeholder='Enter your phone'
            style={underlineStyle(token.colorPrimary)}
            inputMode='tel'
            onKeyDown={onKeyDownPhone}
            onPaste={onPastePhone}
            allowClear
            autoComplete='tel'
          />
        </Form.Item>

        <Form.Item
          name='message'
          required
          rules={required('Required.')}
          label={<span style={labelTextStyle}>Your message</span>}
          className='md:col-span-2'
          style={{ marginBottom: itemMb }}
          getValueFromEvent={(e) => trim(e?.target?.value) || ''}
        >
          <Input.TextArea
            placeholder='Type your message here'
            allowClear
            autoSize={{ minRows: 4, maxRows: 10 }}
            className='placeholder:!text-[#9CA3AF] !pt-2'
            style={{ border: `2px solid ${ORANGE}`, borderRadius: 12 }}
            autoComplete='off'
          />
        </Form.Item>

        <div className='md:col-span-2 flex justify-end'>
          <Button
            htmlType='submit'
            type='primary'
            className='px-10 py-5 font-medium text-white rounded-full border-none cursor-pointer shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:shadow-lg hover:scale-105'
            disabled={f.submissionStatus === 'submitting'}
            loading={f.submissionStatus === 'submitting'}
          >
            {f.submissionStatus === 'submitting' ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </Form>
  );
}
