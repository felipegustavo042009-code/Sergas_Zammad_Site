import zammad from './zammadConeccao.js';
import { verificarToken } from './auth.js';

export async function criarTicket(nome, email, mensagem, categoria, subcategoria) {
    try {
        const response = await zammad.post('/tickets', {
            title: `Ajuda - ${nome}`,
            group: "Users",
            customer: email,
            article: {
                subject: "Pedido de ajuda",
                body: mensagem,
                type: "note",
                internal: false
            }
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao criar ticket:', error.message);
        throw new Error('Erro ao criar ticket no Zammad');
    }
}

export async function pegarGrupos() {
    try {
        let grupos = [];
        let subcategoria = [];
        let categorias = [];

        const valoresCamposGrupos = ["categorias_all"];
        const valoresCamposCategorias = ["erp_categoria", "chamado_ti", "manutencao_predial", "gestao_aparelho_categoria",];
        const valoresCampoSubcategorias = ["erp_subcategoria", "sub_categoria_ti", "sub_categoria_predial", "sub_categoria_gestao_celulares_corporativos"];

        try {
            const res = await zammad.get('/object_manager_attributes');
            const camposTicket = res.data.filter(item => item.object === 'Ticket');
            camposTicket.forEach(campo => {
                if (valoresCampoSubcategorias.includes(campo.name)) {
                    subcategoria.push(campo);
                } else if (valoresCamposCategorias.includes(campo.name)) {
                    categorias.push(campo);
                } else if (valoresCamposGrupos.includes(campo.name)) {
                    grupos.push(campo);
                }
            });
        } catch (err) {
            console.error('Erro ao buscar categorias:', err.response?.data || err.message);
        }
        const gruposFiltrados = grupos.map(g => ({
            id: g.id,
            name: g.name,
            display: g.display
        }));

        const categoriaFiltrado = categorias.map(c => ({
            id: c.id,
            name: c.name,
            display: c.display
        }));

        const subcategoriaFiltrado = subcategoria.map(s => ({
            id: s.id,
            name: s.name,
            display: s.display
        }));
        console.log("Subcategorias encontradas:", subcategoria);
        console.log("Categorias encontradas:", categorias);

        return { gruposFiltrados, subcategoriaFiltrado, categoriaFiltrado };
    } catch (error) {
        console.error('Erro ao buscar grupos:', error.message);
        throw new Error('Erro ao buscar grupos no Zammad');
    }
}

export function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ erro: 'Sem token' });
        }

        const user = verificarToken(token);
        req.user = user;

        next();
    } catch (err) {
        return res.status(401).json({ erro: 'Token inválido' });
    }
}