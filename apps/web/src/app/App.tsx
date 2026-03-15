import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from './Layout';
import { AuthGatedHome } from './AuthGatedHome';
import { PrivacyPage } from './PrivacyPage';
import { TermsPage } from './TermsPage';
import { NotFoundPage } from './NotFoundPage';
import { PageLoader } from './PageLoader';
import { ProtectedRoute } from './ProtectedRoute';

// Code-split each pillar and dashboard routes via React.lazy
const LabelStudioPage = lazy(() => import('../features/label-studio/LabelStudioPage').then(m => ({ default: m.LabelStudioPage })));
const GalleryPage = lazy(() => import('../features/label-studio/GalleryPage').then(m => ({ default: m.GalleryPage })));
const TransferStudioPage = lazy(() => import('../features/transfer-studio/TransferStudioPage').then(m => ({ default: m.TransferStudioPage })));
const DeviceLibraryPage = lazy(() => import('../features/device-library/DeviceLibraryPage').then(m => ({ default: m.DeviceLibraryPage })));
const DeviceDetailPage = lazy(() => import('../features/device-library/DeviceDetailPage').then(m => ({ default: m.DeviceDetailPage })));
const DeviceSubmitPage = lazy(() => import('../features/device-library/DeviceSubmitPage').then(m => ({ default: m.DeviceSubmitPage })));
const AdminDevicesPage = lazy(() => import('../features/device-library/AdminDevicesPage').then(m => ({ default: m.AdminDevicesPage })));
const MarketplacePage = lazy(() => import('../features/marketplace/MarketplacePage').then(m => ({ default: m.MarketplacePage })));
const ListingDetailPage = lazy(() => import('../features/marketplace/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
const SellPage = lazy(() => import('../features/marketplace/SellPage').then(m => ({ default: m.SellPage })));
const CheckoutPage = lazy(() => import('../features/marketplace/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrdersPage = lazy(() => import('../features/marketplace/OrdersPage').then(m => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import('../features/marketplace/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })));
const SellerDashboardPage = lazy(() => import('../features/marketplace/SellerDashboardPage').then(m => ({ default: m.SellerDashboardPage })));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../features/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const AuthCallbackPage = lazy(() => import('../features/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public pages — full-bleed, no Layout chrome */}
          <Route index element={<AuthGatedHome />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />

          {/* App routes — with Layout chrome (nav, footer) */}
          <Route element={<Layout />}>
            {/* Public auth routes */}
            <Route path="auth/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
            <Route path="auth/signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />
            <Route path="auth/callback" element={<Suspense fallback={<PageLoader />}><AuthCallbackPage /></Suspense>} />

            {/* Protected routes — require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="labels" element={<Suspense fallback={<PageLoader />}><LabelStudioPage /></Suspense>} />
              <Route path="labels/gallery" element={<Suspense fallback={<PageLoader />}><GalleryPage /></Suspense>} />
              <Route path="transfer" element={<Suspense fallback={<PageLoader />}><TransferStudioPage /></Suspense>} />
              <Route path="devices" element={<Suspense fallback={<PageLoader />}><DeviceLibraryPage /></Suspense>} />
              <Route path="devices/submit" element={<Suspense fallback={<PageLoader />}><DeviceSubmitPage /></Suspense>} />
              <Route path="devices/:id" element={<Suspense fallback={<PageLoader />}><DeviceDetailPage /></Suspense>} />
              <Route path="admin/devices" element={<Suspense fallback={<PageLoader />}><AdminDevicesPage /></Suspense>} />
              <Route path="marketplace" element={<Suspense fallback={<PageLoader />}><MarketplacePage /></Suspense>} />
              <Route path="marketplace/sell" element={<Suspense fallback={<PageLoader />}><SellPage /></Suspense>} />
              <Route path="marketplace/sell/:id" element={<Suspense fallback={<PageLoader />}><SellPage /></Suspense>} />
              <Route path="marketplace/checkout/:id" element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
              <Route path="marketplace/:id" element={<Suspense fallback={<PageLoader />}><ListingDetailPage /></Suspense>} />
              <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
              <Route path="dashboard/orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
              <Route path="dashboard/orders/:id" element={<Suspense fallback={<PageLoader />}><OrderDetailPage /></Suspense>} />
              <Route path="dashboard/selling" element={<Suspense fallback={<PageLoader />}><SellerDashboardPage /></Suspense>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface-1)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: 'var(--shadow-md)',
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
