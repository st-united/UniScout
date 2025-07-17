import { Input, Select, Button, Modal } from 'antd';
import React from 'react';

const { Option } = Select;

interface CreateAccountProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ open, onCancel, onSubmit }) => {
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
    <Modal open={open} onCancel={onCancel} footer={null} centered destroyOnClose>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Create Account</h2>
        <div className='h-[2px] w-full bg-[#FF7A00]' />
      </div>
      <div className='flex flex-col gap-4 mt-2'>
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
            className='mt-1'
          />
        </div>

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
            className='mt-1'
          />
        </div>

        <div className='flex gap-4'>
          <div className='flex-1'>
            <label htmlFor='role' className='font-semibold text-sm'>
              Role
            </label>
            <Select
              id='role'
              placeholder='Choose role'
              value={formValues.role}
              onChange={(value) => handleChange(value, 'role')}
              className='w-full mt-1'
            >
              <Option value='admin'>Admin</Option>
              <Option value='marketing'>Marketing</Option>
            </Select>
          </div>

          <div className='flex-1'>
            <label htmlFor='status' className='font-semibold text-sm'>
              Status
            </label>
            <Select id='status' disabled value={formValues.status} className='w-full mt-1'>
              <Option value='Pending'>Pending</Option>
            </Select>
          </div>
        </div>

        <div>
          <label htmlFor='password' className='font-semibold text-sm'>
            Password
          </label>
          <Input.Password id='password' disabled value={formValues.password} className='mt-1' />
        </div>

        <div className='flex justify-end gap-4 mt-6'>
          <Button onClick={onCancel}>Cancel</Button>
          <button
            onClick={handleSubmit}
            className='bg-[#FF7A00] text-white px-5 py-2 rounded-[5px] font-medium shadow hover:bg-[#e46b00] transition border-none'
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateAccount;
