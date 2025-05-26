import { ArrowLeftOutlined, RightOutlined } from '@ant-design/icons';
import { Breadcrumb as BreadcrumbAnt } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import './Breadcrumb.scss';

export interface IBreadcrumbItem {
  key: string;
  route?: string;
  name?: string;
}

interface Props {
  items: IBreadcrumbItem[];
}

const { Item } = BreadcrumbAnt;

export const Breadcrumb = ({ items }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const renderBreadcrumbItems = (item: IBreadcrumbItem, index: number) => {
    const isLastItem = index === items.length - 1;
    if (isLastItem) {
      return (
        <Item key={index}>
          {t(`BREADCRUMB.${item.key.toUpperCase()}`)} {item?.name}
        </Item>
      );
    }

    return (
      <Item key={index} className='breadcrumb-item'>
        <Link to={!item.route ? `/${item.key.replace(/_/g, '-')}` : `/${item.route}`}>
          {t(`BREADCRUMB.${item.key.toUpperCase()}`)} {item?.name}
        </Link>
      </Item>
    );
  };

  return (
    <BreadcrumbAnt separator={<RightOutlined />}>
      <Item className='breadcrumb-item' onClick={() => navigate(-1)}>
        <ArrowLeftOutlined />
      </Item>
      <Item className='breadcrumb-item'>
        <Link to='/'>{/* <IconAction className='home-icon' action={ACTION_ENUM.HOME} /> */}</Link>
      </Item>

      {items.map(renderBreadcrumbItems)}
    </BreadcrumbAnt>
  );
};
