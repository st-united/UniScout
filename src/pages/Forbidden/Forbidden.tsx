import { Result, Button } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Forbidden: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Result
      status='403'
      title={t<string>('FORBIDDEN.TITLE')}
      subTitle={t<string>('FORBIDDEN.SUB_TITLE')}
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          {t<string>('FORBIDDEN.BACK_HOME')}
        </Button>
      }
    />
  );
};

export default Forbidden;
