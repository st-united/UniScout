import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loading from './components/common/Loading';
import PrivateRoutes from './routes/private';
import PublicRoutes from './routes/public';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/app/*" element={<PrivateRoutes />} />
      </Routes>
    </Suspense>
  );
}

export default App;