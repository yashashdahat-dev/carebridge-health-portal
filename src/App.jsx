/**
 * CareBridge — Main Application Root Component (React Router Routes)
 * File: src/App.jsx
 * 
 * Demonstrates:
 * - React Router v7 configuration (BrowserRouter, Routes, Route, Outlet) (Task 06)
 * - Nested layouts (Layout.jsx with persistent header, navigation, live status, and footer)
 * - Route parameters (/patients/:id, /prescriptions/:id)
 * - 404 NotFoundPage fallback
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Layout } from './pages/Layout.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PatientsPage } from './pages/PatientsPage.jsx';
import { PatientDetailsPage } from './pages/PatientDetailsPage.jsx';
import { PrescriptionsPage } from './pages/PrescriptionsPage.jsx';
import { PrescriptionDetailsPage } from './pages/PrescriptionDetailsPage.jsx';
import { AccessibilityPage } from './pages/AccessibilityPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export function CareBridgeApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Index Route: Clinical Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Patients Route & Dynamic Detail Parameter (PDF Page 5-6) */}
          <Route path="patients" element={<PatientsPage />}>
            <Route path=":patientId" element={<PatientDetailsPage />} />
            <Route path=":id" element={<PatientDetailsPage />} />
          </Route>
          <Route path="patients/:id" element={<PatientDetailsPage />} />
          <Route path="patients/:patientId" element={<PatientDetailsPage />} />

          {/* Prescriptions Route & Dynamic Detail Parameter */}
          <Route path="prescriptions" element={<PrescriptionsPage />}>
            <Route path=":prescriptionId" element={<PrescriptionDetailsPage />} />
            <Route path=":id" element={<PrescriptionDetailsPage />} />
          </Route>
          <Route path="prescriptions/:id" element={<PrescriptionDetailsPage />} />
          <Route path="prescriptions/:prescriptionId" element={<PrescriptionDetailsPage />} />

          {/* Accessibility & Assistive Settings Route */}
          <Route path="accessibility" element={<AccessibilityPage />} />

          {/* 404 Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <CareBridgeApp />;
}
