import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AdminAuthProvider } from './context/AdminAuthContext.tsx'
import { AccessControlProvider } from './context/AccessControlContext.tsx'
import { LabelsProvider } from './context/LabelsContext.tsx'
import { GlobalLoading } from './components/ui/GlobalLoading.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LabelsProvider>
        <AdminAuthProvider>
          <AccessControlProvider>
            <App />
            <GlobalLoading />
          </AccessControlProvider>
        </AdminAuthProvider>
      </LabelsProvider>
    </BrowserRouter>
  </StrictMode>,
)
