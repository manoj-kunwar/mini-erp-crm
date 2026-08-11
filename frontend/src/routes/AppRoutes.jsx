import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Customers } from '../pages/Customers';
import { CustomerDetails } from '../pages/CustomerDetails';
import { Products } from '../pages/Products';
import { Inventory } from '../pages/Inventory';
import { StockMovements } from '../pages/StockMovements';
import { Challans } from '../pages/Challans';
import { CreateChallan } from '../pages/CreateChallan';
import { ChallanDetails } from '../pages/ChallanDetails';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Common Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* CRM & Sales Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/challans/create" element={<CreateChallan />} />
      </Route>

      {/* Warehouse & Inventory Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/stock-movements" element={<StockMovements />} />
      </Route>

      {/* Accounts & Sales Challan Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
        <Route path="/challans" element={<Challans />} />
        <Route path="/challans/:id" element={<ChallanDetails />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
