import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrandProvider } from './contexts/BrandContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChartOfAccountsPage } from './pages/ChartOfAccountsPage';
import { VouchersPage } from './pages/VouchersPage';
import { CataloguePage } from './pages/CataloguePage';
import { InventoryPage } from './pages/InventoryPage';
import { PublishingPage } from './pages/PublishingPage';
import { SalesPage } from './pages/SalesPage';
import { RoyaltiesPage } from './pages/RoyaltiesPage';
import { DistributorsPage } from './pages/DistributorsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { TaxationPage } from './pages/TaxationPage';
import { BankingPage } from './pages/BankingPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SecurityAuditPage } from './pages/SecurityAuditPage';
import { SettingsPage } from './pages/SettingsPage';
import { CompanyConfigPage } from './pages/CompanyConfigPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const getRolePath = (): string => {
  try {
    const raw = localStorage.getItem('kibo360_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const role: string = parsed?.user?.role || parsed?.user?.roleType || '';
      if (role) {
        const normalized = role.trim().toLowerCase();
        if (
          normalized === 'super_admin' ||
          normalized === 'super administrator' ||
          normalized === 'admin'
        ) {
          return '/admin';
        }
        return '/' + (normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'user');
      }
    }
  } catch {}
  return '/admin';
};

const RoleRedirect: React.FC = () => <Navigate to={getRolePath()} replace />;

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Application Shell */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<RoleRedirect />} />
              <Route path=":role" element={<DashboardPage />} />
              <Route path="accounts" element={<ChartOfAccountsPage />} />
              <Route path="vouchers" element={<VouchersPage />} />
              <Route path="catalogue" element={<CataloguePage />} />
              <Route path="books" element={<CataloguePage />} />
              <Route path="publishing" element={<PublishingPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="pos" element={<SalesPage />} />
              <Route path="invoicing" element={<SalesPage />} />
              <Route path="distributors" element={<DistributorsPage />} />
              <Route path="royalties" element={<RoyaltiesPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="taxation" element={<TaxationPage />} />
              <Route path="banking" element={<BankingPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="returns" element={<ReturnsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="security" element={<SecurityAuditPage />} />
              <Route path="company-config" element={<CompanyConfigPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<RoleRedirect />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BrandProvider>
    </QueryClientProvider>
  );
};

export default App;
