import { EyeInvisibleOutlined, EyeTwoTone, MenuOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Typography, message } from 'antd';
import { Rule } from 'antd/lib/form';
import axios from 'axios';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import i18n from '@app/config/i18n';
import { setStorageStringData } from '@app/config/storage';
import { yupSync } from '@app/helpers/yupSync';
import { login } from '@app/redux/features/auth/authSlice';
import store from '@app/redux/store';
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validator = [yupSync(signInSchema)] as unknown as Rule[];

  const handleSubmit = async (values: ISignInForm) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken, name } = response.data.data;

      if (accessToken && refreshToken) {
        setStorageStringData('accessToken', accessToken);
        setStorageStringData('refreshToken', refreshToken);

        dispatch(login());
        message.success('Login successful!');
        console.log(
          'SignInForm: Login successful. Redux isAuth after dispatch:',
          store.getState().auth.isAuth,
        );
        console.log('SignInForm: Redirecting to /admin/dashboard');
        navigate('/dashboard');
      } else {
        throw new Error('Authentication tokens not received from the server.');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage =
          error.response.data.message || 'Login failed. Please check your credentials.';
        message.error(errorMessage);
      } else {
        message.error('An unexpected error occurred during login. Please try again.');
      }
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
      xl={12}
      className={`bg-[#e2e3e3] flex items-center justify-center min-h-screen p-0 order-1 md:order-2 ${className}`}
    >
      <div className='w-full max-w-md px-4'>
        <div className='text-center mb-8'>
          <Title level={1} className='text-4xl font-bold text-gray-900'>
            Welcome Back !
          </Title>
          <Paragraph className='text-lg text-orange-400 font-medium italic'>
            Login to continue
          </Paragraph>
        </div>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout='vertical'
          className='space-y-6'
          initialValues={previousValue}
        >
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

          <Form.Item className='mb-0'>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              className='w-full h-14 rounded-lg text-2xl font-bold text-white border-none'
              style={{
                backgroundColor: '#f97316', // orange-500
                border: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fb923c')} // orange-300
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
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
