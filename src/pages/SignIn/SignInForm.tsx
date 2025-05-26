import { Button, Form, Input, Typography } from 'antd';
import { Rule } from 'antd/lib/form';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { logo } from '@app/assets/images';
import i18n from '@app/config/i18n';
import { VITE_NAME } from '@app/constants/appName';
import { yupSync } from '@app/helpers/yupSync';
import { useLogin } from '@app/hooks/useAuth';

type ISignInForm = {
  email: string;
  password: string;
};

type SignInProps = {
  previousValue: ISignInForm;
  onInputChange: (name: string, value: string) => void;
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

const { Paragraph } = Typography;
const { Password } = Input;

const SignInForm: FC<SignInProps> = ({ onInputChange, previousValue }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { mutate: signIn } = useLogin();

  const validator = [yupSync(signInSchema)] as unknown as Rule[];

  return (
    <Form
      form={form}
      onFinish={(credentials) => signIn(credentials)}
      labelWrap={true}
      className='form-login'
    >
      <img src={logo} alt='Logo' style={{ marginBottom: '25px' }} />

      <Paragraph style={{ font: '24px Quicksand', marginBottom: '46px', fontWeight: 500 }}>
        {VITE_NAME}
      </Paragraph>

      <Button style={{ fontSize: '16px' }} type='primary' block htmlType='submit'>
        {t<string>('LOGIN.TEXT')}
      </Button>
    </Form>
  );
};

export default SignInForm;
