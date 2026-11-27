import React from 'react';
import { RygnWebApp } from './components/RygnWebApp';
import { WelcomeIntroOverlay } from './components/WelcomeIntroOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { CmsProvider } from './contexts/CmsContext';
import { ToastProvider } from './contexts/ToastContext';
import { InlineEditModalHost } from './components/InlineEditable';

const AppShell: React.FC = () => {
  return (
    <>
      <WelcomeIntroOverlay />
      <RygnWebApp />
      <InlineEditModalHost />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <FirebaseProvider>
          <CmsProvider>
            <AppShell />
          </CmsProvider>
        </FirebaseProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
