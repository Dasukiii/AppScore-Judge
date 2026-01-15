import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import {
  LandingPage,
  Dashboard,
  SubmitApp,
  AppLibrary,
  Results,
  PDPAPolicy,
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pdpa-policy" element={<PDPAPolicy />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitApp />} />
            <Route path="/library" element={<AppLibrary />} />
            <Route path="/results" element={<Results />} />
            <Route path="/results/:id" element={<Results />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
