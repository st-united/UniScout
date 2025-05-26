import { Modal as ModalAntd, ModalProps } from 'antd';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const Modal: FC<ModalProps> = ({ children, ...props }) => {
  const className = props.className ? props.className : '';
  const { t } = useTranslation();

  return (
    <ModalAntd
      className={`modal ${className}`}
      centered={true}
      okText={t<string>('BUTTON.SAVE')}
      cancelText={t<string>('BUTTON.CANCEL')}
      okButtonProps={{ className: 'button', type: 'primary' }}
      cancelButtonProps={{ style: { display: 'none' } }}
      {...props}
    >
      {children}
    </ModalAntd>
  );
};
