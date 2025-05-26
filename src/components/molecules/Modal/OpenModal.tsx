import { Modal, Row, Typography } from 'antd';
import { Translation } from 'react-i18next';

import { ModalTypeEnum } from '@app/constants/modalType';
import './openModal.scss';

export const openModal = (
  handleOkeAction: () => void,
  type: ModalTypeEnum,
  url: string,
  content: string,
  title: string,
  textBtn?: string,
  childrenContent?: string,
) => {
  Modal[type]({
    icon: (
      <Row justify='center' style={{ marginBottom: '1rem' }}>
        <img src={`${url}`} alt='#' />
      </Row>
    ),
    title: (
      <Row justify='center' style={{ fontWeight: 600 }}>
        {title}
      </Row>
    ),
    className: 'modal-open',
    content: (
      <>
        <Row justify='center' style={{ fontWeight: 500 }}>
          {content}
        </Row>
        <Row style={{ fontWeight: 600 }} justify='center'>
          {childrenContent}
        </Row>
      </>
    ),
    cancelText: (
      <Typography style={{ fontWeight: 500 }}>
        <Translation>{(t) => t<string>('BUTTON.CANCEL')}</Translation>
      </Typography>
    ),
    okText: textBtn ? (
      textBtn
    ) : (
      <Typography style={{ fontWeight: 500, color: '#FFFFFF' }}>
        <Translation>{(t) => t<string>('BUTTON.OK')}</Translation>
      </Typography>
    ),
    onOk() {
      handleOkeAction();
    },
  });
};
