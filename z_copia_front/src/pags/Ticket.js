import {Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../css/ticked.css';

async function TickedPagina() {
    const [grupos, setGrupos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    return (
        <div>
            <h1>Ticked</h1>
        </div>
    );
}

export default TickedPagina;