import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthListener from './components/AuthListener'; // <- Nueva importación
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DadorDeCarga from './pages/DadorDeCarga';
import QuoteRequest from './pages/QuoteRequest';
import QuoteManagement from './pages/QuoteManagement';
import ShipmentTracking from './pages/ShipmentTracking';
import History from './pages/History';
import Profile from './pages/Profile';
import OperadorLogistico from './pages/OperadorLogistico';
import BrokerLogistico from './pages/BrokerLogistico';
import Solutions from './pages/Solutions';
import Legal from './pages/Legal';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';


// Operador Logístico Pages
import OperadorDashboard from './pages/operador/Dashboard';
import OperadorOportunidades from './pages/operador/Oportunidades';
import OperadorCotizaciones from './pages/operador/Cotizaciones';
import OperadorViajes from './pages/operador/Viajes';
import OperadorDocumentos from './pages/operador/Documentos';
import OperadorConfiguracion from './pages/operador/Configuracion';

// Broker Logístico Pages
import BrokerDashboard from './pages/broker/Dashboard';
import BrokerClientes from './pages/broker/Clientes';
import BrokerTransportistas from './pages/broker/Transportistas';
import BrokerMarketplace from './pages/broker/Marketplace';
import BrokerOperaciones from './pages/broker/Operaciones';
import BrokerAnalytics from './pages/broker/Analytics';
import BrokerFacturacion from './pages/broker/Facturacion';
import BrokerConfiguracion from './pages/broker/Configuracion';

function App() {
  return (
    <Router>
      <AuthListener /> {/* <- AuthListener agregado aquí */}
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* Operador Logístico Routes */}
        <Route path="/operador" element={<OperadorLogistico />}>
          <Route index element={<OperadorDashboard />} />
          <Route path="oportunidades" element={<OperadorOportunidades />} />
          <Route path="cotizaciones" element={<OperadorCotizaciones />} />
          <Route path="viajes" element={<OperadorViajes />} />
          <Route path="documentos" element={<OperadorDocumentos />} />
          <Route path="configuracion" element={<OperadorConfiguracion />} />
        </Route>

        {/* Broker Logístico Routes */}
        <Route path="/broker" element={<BrokerLogistico />}>
          <Route index element={<BrokerDashboard />} />
          <Route path="clientes" element={<BrokerClientes />} />
          <Route path="transportistas" element={<BrokerTransportistas />} />
          <Route path="marketplace" element={<BrokerMarketplace />} />
          <Route path="operaciones" element={<BrokerOperaciones />} />
          <Route path="analytics" element={<BrokerAnalytics />} />
          <Route path="facturacion" element={<BrokerFacturacion />} />
          <Route path="configuracion" element={<BrokerConfiguracion />} />
        </Route>

        {/* Dador de Carga Routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<DadorDeCarga />} />
          <Route path="quote-request" element={<QuoteRequest />} />
          <Route path="quotes" element={<QuoteManagement />} />
          <Route path="tracking" element={<ShipmentTracking />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;