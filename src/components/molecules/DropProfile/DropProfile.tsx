import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps, Typography } from 'antd';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

// import { iconLogout, iconProfile, logoAvatarDefault } from '@app/assets/images';
import { removeStorageData } from '@app/config';
import { ACCESS_TOKEN, NAVIGATE_URL } from '@app/constants';
import { logout } from '@app/redux/features/auth/authSlice';
import { RootState } from '@app/redux/store';
import './DropProfile.scss';

export const DropProfile: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatchAuth = useDispatch();
  const { logout: authLogout } = useAuth();

  const { user } = useSelector((state: RootState) => state.auth);
  const [activeItem, setActiveItem] = useState<boolean>(false);

  const handleUser = (key: string) => {
    if (key === 'profile') {
      navigate(NAVIGATE_URL.PROFILE);
    }
  };

  const handleSignOut = () => {
    removeStorageData(ACCESS_TOKEN);
    dispatchAuth(logout());
    authLogout();
    navigate(NAVIGATE_URL.SIGN_IN);
  };

  const items: MenuProps['items'] = [
    {
      label: <Typography.Text>{t('DROPDOWN_PROFILE.PROFILE')}</Typography.Text>,
      key: 'profile',
      // icon: <img src={iconProfile} alt='icon-profile' />,
      className: 'item-profile',
      onClick: () => {
        handleUser('profile');
      },
    },
    {
      label: <Typography.Text>{t('DROPDOWN_PROFILE.SIGN_OUT')}</Typography.Text>,
      key: NAVIGATE_URL.SIGN_OUT,
      danger: true,
      // icon: <img src={iconLogout} alt='icon-logout' />,
      className: 'item-signout',
      onClick: handleSignOut,
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        onClick: (item) => {
          handleUser(item.key);
          setActiveItem(!activeItem);
        },
      }}
      trigger={['click']}
      className='profile-dropdown'
      overlayClassName='profile-menu'
      placement='bottom'
      onOpenChange={() => setActiveItem(!activeItem)}
    >
      <div className='flex items-center cursor-pointer'>
        <Avatar size={40} className='drop-avatar' src={user?.avatar ? user?.avatar : null} />
        <span className='drop-name ml-2 mr-1'>{user?.name}</span>
        {activeItem === true ? (
          <CaretUpOutlined className='drop-name' />
        ) : (
          <CaretDownOutlined className='drop-name' />
        )}
      </div>
    </Dropdown>
  );
};
