import { Button, Result } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Result
      status='404'
      title={t<string>('NOT_FOUND.TITLE')}
      subTitle={t<string>('NOT_FOUND.SUB_TITLE')}
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          {t<string>('NOT_FOUND.BACK_HOME')}
        </Button>
      }
    />
  );
};

export default NotFound;
