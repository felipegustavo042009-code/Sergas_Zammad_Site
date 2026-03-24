import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';

import HomePagina from './pags/Home'
import LoginPagina from './pags/Login'
import TicketPagina from './pags/Ticket.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePagina/>} />
        <Route path="/login" element={<LoginPagina/>} />
        <Route path='/ticket' element={<TicketPagina/>} />
      </Routes>
    </Router>
  );
}

export default App;
