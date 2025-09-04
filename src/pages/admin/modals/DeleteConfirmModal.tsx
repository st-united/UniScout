import { Modal, Button, Typography, ConfigProvider } from 'antd';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

type DeleteType = 'single' | 'bulk';

interface DeleteConfirmModalProps {
  open: boolean;
  deleteType: DeleteType;
  universityToDelete?: { university: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  deleteType,
  universityToDelete,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const isSingle = deleteType === 'single' && universityToDelete?.university;

  const messageText = isSingle ? (
    <>
      Are you sure you want to delete “
      <Typography.Text strong className='text-[#475467]'>
        {universityToDelete?.university}
      </Typography.Text>
      ”? This action cannot be undone.
    </>
  ) : (
    <>Are you sure you want to delete all selected fields? This action cannot be undone.</>
  );
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      closable={true}
      maskClosable={false}
      width={520}
      styles={{ content: { borderRadius: 16, padding: 24 } }}
    >
      {/* Big red icon */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className='h-[120px] w-[120px] rounded-full bg-[#FEEEEE] flex items-center justify-center mb-5'>
          <div className='h-[100px] w-[100px] rounded-full bg-[#FFDEDE] flex items-center justify-center'>
            <TriangleAlert className='flex h-[50px] w-[50px] text-[#FF0000] my-auto' />
          </div>
        </div>
      </div>

      {/* Title */}
      <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: 8 }}>
        Warning
      </Typography.Title>

      {/* Message in your desired style */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          justifyContent: 'center',
          maxWidth: 380,
          margin: '0 auto 20px',
        }}
      >
        <Typography.Paragraph className='text-[#475467] text-center mb-5'>
          {messageText}
        </Typography.Paragraph>
      </div>

      {/* Actions */}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#FF7A45',
          },
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Button onClick={onCancel} style={{ minWidth: 120 }}>
            Cancel
          </Button>
          <Button
            type='primary'
            loading={loading}
            onClick={onConfirm}
            style={{ minWidth: 120, background: '#FF7A45', borderColor: '#FF7A45' }}
          >
            DELETE
          </Button>
        </div>
      </ConfigProvider>
    </Modal>
  );
};

export default DeleteConfirmModal;
