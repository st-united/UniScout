import React from 'react';
// import { Translation } from 'react-i18next'; // Remove unused import
import { useTranslation } from 'react-i18next';

// import { Modal, Row, Typography } from 'antd'; // Remove unused import
// import { ModalTypeEnum } from '@app/constants/modalType'; // Remove unused import
import './openModal.scss';

interface OpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const OpenModal: React.FC<OpenModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('BUTTON.CANCEL')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark"
            >
              {t('BUTTON.OK')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenModal;
