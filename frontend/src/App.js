import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Pay from './pages/Pay';
import ReferralLanding from './pages/ReferralLanding';
import ReferrerDashboard from './pages/ReferrerDashboard';
import AdminPanel from './pages/AdminPanel';
import ContentStudio from './pages/ContentStudio';
import ContentResult from './pages/ContentResult';
import ContentLibrary from './pages/ContentLibrary';
import InstallGuide from './pages/InstallGuide';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pay/:id" element={<Pay />} />
          <Route path="/r/:code" element={<ReferralLanding />} />
          <Route path="/dashboard" element={<ReferrerDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/studio" element={<ContentStudio />} />
          <Route path="/studio/library" element={<ContentLibrary />} />
          <Route path="/studio/result/:id" element={<ContentResult />} />
          <Route path="/install" element={<InstallGuide />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
