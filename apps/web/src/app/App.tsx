import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { LabelStudioPage } from '../features/label-studio/LabelStudioPage';
import { TransferStudioPage } from '../features/transfer-studio/TransferStudioPage';
import { DeviceLibraryPage } from '../features/device-library/DeviceLibraryPage';
import { MarketplacePage } from '../features/marketplace/MarketplacePage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="labels" element={<LabelStudioPage />} />
          <Route path="transfer" element={<TransferStudioPage />} />
          <Route path="devices" element={<DeviceLibraryPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/signup" element={<SignupPage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#141417',
            color: '#e8e8ec',
            border: '1px solid #2a2a32',
            borderRadius: '6px',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  );
}
