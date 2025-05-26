import { Row, Typography } from 'antd';
import { t } from 'i18next';

import './EmptyData.scss';

interface Props {
  content?: string;
  type?: 'large' | 'small';
}

export const EmptyData = ({ content, type = 'large' }: Props) => {
  const name = type === 'large' ? 'large-empty' : type === 'small' ? 'small-empty' : '';
  return (
    <div className={name}>
      <Row className='children-container'>
        <Typography className='empty-text'>
          {content ? content : t<string>('TABLE.EMPTY')}
        </Typography>
      </Row>
    </div>
  );
};
