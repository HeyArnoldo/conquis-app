import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cep from "./pages/Cep";
import CepCategory from "./pages/CepCategory";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/cep" element={<Cep />} />
        <Route path="/cep/:categorySlug" element={<CepCategory />} />
        <Route path="/" element={<Navigate to="/cep" replace />} />
        <Route path="/inicio" element={<Navigate to="/cep" replace />} />
        <Route path="/categorias" element={<Navigate to="/cep" replace />} />
        <Route path="/especialidades" element={<Navigate to="/cep" replace />} />
        <Route path="/category/:areaSlug" element={<Navigate to="/cep" replace />} />
        <Route path="/integracion" element={<Navigate to="/cep" replace />} />
        <Route path="*" element={<Navigate to="/cep" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
