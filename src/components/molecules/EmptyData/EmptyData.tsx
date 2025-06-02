import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';

import './EmptyData.scss';

interface EmptyDataProps {
  content?: React.ReactNode;
}

const EmptyData: React.FC<EmptyDataProps> = ({ content }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Typography.Text type="secondary">
        {content || t('TABLE.EMPTY')}
      </Typography.Text>
    </div>
  );
};

export default EmptyData;
