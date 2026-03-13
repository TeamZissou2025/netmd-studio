import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { LabelStudioPage } from '../features/label-studio/LabelStudioPage';
import { GalleryPage } from '../features/label-studio/GalleryPage';
import { TransferStudioPage } from '../features/transfer-studio/TransferStudioPage';
import { DeviceLibraryPage } from '../features/device-library/DeviceLibraryPage';
import { DeviceDetailPage } from '../features/device-library/DeviceDetailPage';
import { DeviceSubmitPage } from '../features/device-library/DeviceSubmitPage';
import { AdminDevicesPage } from '../features/device-library/AdminDevicesPage';
import { MarketplacePage } from '../features/marketplace/MarketplacePage';
import { ListingDetailPage } from '../features/marketplace/ListingDetailPage';
import { SellPage } from '../features/marketplace/SellPage';
import { CheckoutPage } from '../features/marketplace/CheckoutPage';
import { OrdersPage } from '../features/marketplace/OrdersPage';
import { OrderDetailPage } from '../features/marketplace/OrderDetailPage';
import { SellerDashboardPage } from '../features/marketplace/SellerDashboardPage';
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
          {/* Label Studio */}
          <Route path="labels" element={<LabelStudioPage />} />
          <Route path="labels/gallery" element={<GalleryPage />} />
          {/* Transfer Studio */}
          <Route path="transfer" element={<TransferStudioPage />} />
          {/* Device Library */}
          <Route path="devices" element={<DeviceLibraryPage />} />
          <Route path="devices/submit" element={<DeviceSubmitPage />} />
          <Route path="devices/:id" element={<DeviceDetailPage />} />
          <Route path="admin/devices" element={<AdminDevicesPage />} />
          {/* Marketplace */}
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/sell" element={<SellPage />} />
          <Route path="marketplace/sell/:id" element={<SellPage />} />
          <Route path="marketplace/checkout/:id" element={<CheckoutPage />} />
          <Route path="marketplace/:id" element={<ListingDetailPage />} />
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/orders" element={<OrdersPage />} />
          <Route path="dashboard/orders/:id" element={<OrderDetailPage />} />
          <Route path="dashboard/selling" element={<SellerDashboardPage />} />
          {/* Auth */}
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
