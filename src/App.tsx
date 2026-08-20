import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { MiddleSection } from './components/MiddleSection';
import { BelumInvoicedSection } from './components/BelumInvoicedSection';
import { TindakLanjutTable } from './components/TindakLanjutTable';
import { DrilldownModal } from './components/DrilldownModal';
import { EditFollowUpModal } from './components/EditFollowUpModal';
import { SharePointSyncModal } from './components/SharePointSyncModal';
import { MicrosoftAuthModal } from './components/MicrosoftAuthModal';
import { LoginModal } from './components/LoginModal';
import { SharePointQuickBar } from './components/SharePointQuickBar';
import { PresentationView } from './components/PresentationView';

// Views
import { RingkasanARView } from './components/views/RingkasanARView';
import { AgingARView } from './components/views/AgingARView';
import { LayakTagihView } from './components/views/LayakTagihView';
import { InvoiceStatusView } from './components/views/InvoiceStatusView';
import { BelumInvoicedView } from './components/views/BelumInvoicedView';
import { TindakLanjutView } from './components/views/TindakLanjutView';
import { LaporanView } from './components/views/LaporanView';
import { PengaturanView } from './components/views/PengaturanView';

const MainLayout: React.FC = () => {
  const { activeTab, presentationMode, user } = useDashboard();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (presentationMode) {
    return (
      <>
        <PresentationView />
        <DrilldownModal />
        <EditFollowUpModal />
        <SharePointSyncModal />
        <MicrosoftAuthModal />
        <LoginModal forceGate={!user.isLoggedIn} />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <MetricCards />
            <MiddleSection />
            <BelumInvoicedSection />
            <TindakLanjutTable />
          </>
        );
      case 'ringkasan':
        return <RingkasanARView />;
      case 'aging':
        return <AgingARView />;
      case 'layak-tagih':
        return <LayakTagihView />;
      case 'invoice-status':
        return <InvoiceStatusView />;
      case 'belum-invoiced':
        return <BelumInvoicedView />;
      case 'tindak-lanjut':
        return <TindakLanjutView />;
      case 'laporan':
        return <LaporanView />;
      case 'pengaturan':
        return <PengaturanView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#243327] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar Navigation */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content Dashboard Area */}
      <main className="flex-1 h-full overflow-y-auto bg-[#f4f7f3] text-[#1c291e] p-4 sm:p-6 lg:p-7 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Header />
          <SharePointQuickBar />
          {renderActiveView()}
        </div>
      </main>

      {/* Global Modals */}
      <DrilldownModal />
      <EditFollowUpModal />
      <SharePointSyncModal />
      <MicrosoftAuthModal />
      <LoginModal forceGate={!user.isLoggedIn} />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <MainLayout />
    </DashboardProvider>
  );
}
