import { Input, Select, Button, Modal, ConfigProvider } from 'antd';
import React from 'react';

const { Option } = Select;

interface CreateAccountProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  jobRoles: string[];
}

const CreateAccount: React.FC<CreateAccountProps> = ({ open, onCancel, onSubmit, jobRoles }) => {
  const [formValues, setFormValues] = React.useState({
    name: '',
    email: '',
    role: '',
    status: 'Pending',
    password: '••••••••••••',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | string,
    name?: string,
  ) => {
    if (typeof e === 'string' && name) {
      setFormValues((prev) => ({ ...prev, [name]: e }));
    } else if (typeof e === 'object' && e !== null && 'target' in e) {
      const target = (e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>).target;
      setFormValues((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleSubmit = () => {
    const { name, email, role } = formValues;
    if (!name || !email || !role) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit(formValues);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF7A45',
          borderRadius: 6,
          controlHeight: 40,
          fontWeightStrong: 500,
          fontSize: 14,
          fontFamily: 'Arial,sans-serif',
        },
      }}
    >
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        centered
        destroyOnClose
        width={650}
        bodyStyle={{ borderRadius: 20, padding: 8 }}
      >
        <div className='mb-6'>
          <h2 className='text-[21px] font-semibold mb-2'>Create Account</h2>
          <div className='border-solid border-[1px] border-[#FF7A45] w-full' />
        </div>

        <div className='flex flex-col gap-4 mt-2'>
          {/* Name */}
          <div>
            <label htmlFor='name' className='font-semibold text-sm'>
              Name
            </label>
            <Input
              id='name'
              name='name'
              value={formValues.name}
              onChange={handleChange}
              placeholder='Enter the full name of the user'
              className='mt-1 rounded-md h-12 !font-medium'
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor='email' className='font-semibold text-sm'>
              Email
            </label>
            <Input
              id='email'
              name='email'
              type='email'
              value={formValues.email}
              onChange={handleChange}
              placeholder='Enter email address'
              className='mt-1 rounded-md h-12 !font-[500] '
            />
          </div>

          {/* Department & Status */}
          <div className='flex gap-4'>
            <div className='flex-1'>
              <label htmlFor='role' className='font-semibold text-sm'>
                Department
              </label>
              <Select
                id='role'
                placeholder='Choose department'
                value={formValues.role || undefined}
                onChange={(value) => handleChange(value, 'role')}
                className='w-full mt-1 rounded-md h-12 !font-[500]'
                dropdownStyle={{
                  fontSize: 13,
                  fontWeight: 400,
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: '#fff',
                  borderRadius: 8,
                }}
              >
                {jobRoles.map((role: string) => (
                  <Option key={role} value={role}>
                    {role}
                  </Option>
                ))}
              </Select>
            </div>

            <div className='flex-1'>
              <label htmlFor='status' className='font-semibold text-sm'>
                Status
              </label>
              <Select
                id='status'
                disabled
                value={formValues.status}
                className='w-full mt-1 rounded-md h-12 !font-[500]'
              >
                <Option value='Pending'>Pending</Option>
              </Select>
            </div>
          </div>

          {/* Password */}
          <div className='flex flex-col'>
            <label htmlFor='password' className='font-semibold text-sm w-full'>
              Password
            </label>
            <Input.Password
              id='password'
              disabled
              value={formValues.password}
              iconRender={() => null}
              className='mt-1 rounded-md h-12 w-full lg:max-w-[calc(50%-8px)] text-sm !font-[500]'
            />
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-4 mt-2'>
            <Button onClick={onCancel} style={{ height: 40, width: 75 }}>
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              type='primary'
              style={{
                backgroundColor: '#FF7A45',
                borderColor: '#FF7A45',
                padding: '8px 24px',
                height: 40,
                width: 75,
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default CreateAccount;
