import { EyeInvisibleOutlined, EyeTwoTone, MenuOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Typography, message } from 'antd';
import { Rule } from 'antd/lib/form';
import axios from 'axios';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import i18n from '@app/config/i18n';
import { yupSync } from '@app/helpers/yupSync';

type ISignInForm = {
  email: string;
  password: string;
};

type SignInProps = {
  previousValue: ISignInForm;
  onInputChange: (name: string, value: string) => void;
  className?: string;
};

const signInSchema = yup.object().shape({
  email: yup
    .string()
    .email(i18n.t('VALIDATE.INVALID', { field: i18n.t('LOGIN.EMAIL') }) as string)
    .trim()
    .required(i18n.t('VALIDATE.REQUIRED', { field: i18n.t('LOGIN.EMAIL') }) as string),
  password: yup
    .string()
    .trim()
    .required(i18n.t('VALIDATE.REQUIRED', { field: i18n.t('LOGIN.PASSWORD') }) as string),
});

const { Paragraph, Title } = Typography;
const { Password } = Input;

const SignInForm: FC<SignInProps> = ({ onInputChange, previousValue, className }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ needed for redirect

  const validator = [yupSync(signInSchema)] as unknown as Rule[];

  const handleSubmit = async (values: ISignInForm) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token); // ✅ store token
        message.success('Login successful');
        navigate('/'); // ✅ redirect after login
      } else {
        throw new Error('No token received');
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col
      xs={24}
      sm={24}
      md={12}
      lg={12}
      xl={10}
      className={`bg-[#e2e3e3] flex items-center justify-center min-h-screen px-8 ${className}`}
    >
      <div className='w-full max-w-md'>
        {/* Mobile Menu Icon */}
        <div className='flex justify-end mb-8 md:hidden'>
          <MenuOutlined className='text-2xl text-gray-600' />
        </div>

        {/* Welcome Header */}
        <div className='text-center mb-8'>
          <Title level={1} className='text-4xl font-bold text-gray-900 mb-2'>
            Welcome Back !
          </Title>
          <Paragraph className='text-lg text-orange-500 font-medium'>Login to continue</Paragraph>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          onFinish={handleSubmit}
          layout='vertical'
          className='space-y-6'
          initialValues={previousValue}
        >
          {/* Email Field */}
          <Form.Item
            name='email'
            label={<span className='text-gray-900 font-semibold text-base'>Email</span>}
            rules={validator}
            className='mb-6'
          >
            <Input
              placeholder='Enter your email'
              className='h-12 rounded-lg border-gray-200 text-base px-4'
              onChange={(e) => onInputChange('email', e.target.value)}
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name='password'
            label={<span className='text-gray-900 font-semibold text-base'>Password</span>}
            rules={validator}
            className='mb-4'
          >
            <Password
              placeholder='Enter your password'
              className='h-12 rounded-lg border-gray-200 text-base'
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              onChange={(e) => onInputChange('password', e.target.value)}
            />
          </Form.Item>

          {/* Forgot Password Link */}
          <div className='text-right mb-6'>
            <button
              type='button'
              className='underline text-orange-500 hover:text-orange-600 font-medium text-base bg-transparent border-none p-0 cursor-pointer'
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <Form.Item className='mb-0'>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              className='text-[#D79275] w-full h-14 bg-blue-900 hover:bg-blue-700 border-none rounded-lg text-2xl font-bold'
            >
              Login now
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Col>
  );
};

export default SignInForm;
