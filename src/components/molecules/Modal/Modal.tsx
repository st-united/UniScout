import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal as AntModal } from 'antd';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children
}) => {
  const { t } = useTranslation();

  return (
    <AntModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={onConfirm}
      okText={t('BUTTON.SAVE')}
      cancelText={t('BUTTON.CANCEL')}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
