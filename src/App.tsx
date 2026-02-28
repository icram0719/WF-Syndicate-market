/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PriceProvider } from './context/PriceContext';
import { Layout } from './components/Layout';
import { AllMods } from './pages/AllMods';
import { Suggestions } from './pages/Suggestions';

export default function App() {
  return (
    <PriceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<AllMods />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PriceProvider>
  );
}
