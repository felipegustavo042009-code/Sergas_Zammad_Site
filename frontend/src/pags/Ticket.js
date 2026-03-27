// src/pags/Ticket.js
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../css/ticked.css';

function TickedPagina() {
    const [grupos, setGrupos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const response = await fetch('http://localhost:3000/grupos', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setGrupos(data.gruposFiltrados || []);
                setCategorias(data.categoriaFiltrado || []);
                setSubcategorias(data.subcategoriaFiltrado || []);
            } catch (error) {
                console.error('Erro ao buscar grupos:', error);
            }
        };

        if (token) {
            fetchGrupos();
        }
    }, [token]);

    return (
        <div>
            <h1>Meus Chamados</h1>
            <Link to="/abrir-chamado">Abrir Novo Chamado</Link>
        </div>
    );
}

export default TickedPagina;