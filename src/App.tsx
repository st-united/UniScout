import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Loading from '@app/components/molecules/common/Loading';

function App() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <Outlet />
    </Suspense>
  );
}

export default App; 