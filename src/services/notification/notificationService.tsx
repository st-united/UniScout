import {
  InfoCircleFilled,
  ExclamationCircleFilled,
  WarningFilled,
  CheckCircleFilled,
} from '@ant-design/icons';
import { notification } from 'antd';
import './notification.scss';

export enum NotificationTypeEnum {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export const openNotificationWithIcon = (type: NotificationTypeEnum, description: string) => {
  let icon = <CheckCircleFilled style={{ color: 'white' }} />;

  switch (type) {
    case NotificationTypeEnum.INFO:
      icon = <InfoCircleFilled style={{ color: 'white' }} />;
      break;
    case NotificationTypeEnum.ERROR:
      icon = <ExclamationCircleFilled style={{ color: 'white' }} />;
      break;
    case NotificationTypeEnum.WARNING:
      icon = <WarningFilled style={{ color: 'white' }} />;
      break;
    case NotificationTypeEnum.SUCCESS:
      icon = <CheckCircleFilled style={{ color: 'white' }} />;
      break;
  }

  notification[type]({
    message: description,
    className: `notification-${type}`,
    closeIcon: <></>,
    placement: 'bottom',
    icon: icon,
  });
};
