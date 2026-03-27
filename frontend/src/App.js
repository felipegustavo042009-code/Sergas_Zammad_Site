// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePagina from './pags/Home';
import LoginPagina from './pags/Login';
import TicketPagina from './pags/Ticket';
import AbrirChamado from './pags/AbrirChamado.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePagina />} />
        <Route path="/login" element={<LoginPagina />} />
        <Route path="/ticket" element={<TicketPagina />} />
        <Route path="/abrir-chamado" element={<AbrirChamado />} />
      </Routes>
    </Router>
  );
}

export default App;