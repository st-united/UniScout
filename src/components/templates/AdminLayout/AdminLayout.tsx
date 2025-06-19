import { Outlet } from 'react-router-dom';

import Sidebar from '@app/components/Sidebar';

const AdminLayout = () => {
  return (
    <div className='flex flex-row h-screen w-full'>
      <Sidebar
        activeTab='manage-university'
        setActiveTab={() => {
          // Intentionally left empty
        }}
      />
      <div className='flex-1 p-6 overflow-y-auto w-full'>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
