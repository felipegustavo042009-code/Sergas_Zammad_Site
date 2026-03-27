import zammad from './zammadConeccao.js';
import { verificarToken } from './auth.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dadosCategorias;

try {
    const dadosPath = join(__dirname, 'data', 'categorias', 'categorias.json');
    const dadosRaw = await fs.readFile(dadosPath, 'utf-8');
    dadosCategorias = JSON.parse(dadosRaw);

    console.log('✅ Dados de categorias carregados com sucesso' + dadosCategorias);
} catch (error) {
    console.error('❌ Erro ao carregar dados.json:', error.message);
}

export async function criarTicket(nome, email, mensagem, titulo, grupo, categoria, subcategoria) {
    
    try {
        const response = await zammad.post('/tickets', {
            title: titulo || `Solicitação - ${nome}`,
            group: grupo || "Users",
            customer: email,
            article: {
                subject: titulo || "Solicitação de atendimento",
                body: mensagem,
                type: "note",
                internal: false
            }
        });

        if (categoria) {
            try {
                await zammad.put(`/tickets/${response.data.id}`, {
                    ticket: {
                        [categoria]: subcategoria || 'Não informada'
                    }
                });
            } catch (err) {
                console.error('Erro ao adicionar categoria personalizada:', err.message);
            }
        }

        return response.data;
    } catch (error) {
        console.error('Erro ao criar ticket:', error.response?.data || error.message);
        throw new Error('Erro ao criar ticket no Zammad');
    }
}

export async function pegarCategorias() {
    try {
        const gruposFiltrados = dadosCategorias.map(g => ({
            chave: g.grupo.toLowerCase().replace(/ /g, '_'),
            nome: g.grupo
        }));

        const categoriaFiltrado = [];
        dadosCategorias.forEach(grupo => {
            grupo.categoria.forEach(cat => {
                categoriaFiltrado.push({
                    chave: cat.chave,
                    nome: cat.nome,
                    grupo: grupo.grupo,
                    grupoChave: grupo.grupo.toLowerCase().replace(/ /g, '_')
                });
            });
        });

        const subcategoriaFiltrado = [];
        dadosCategorias.forEach(grupo => {
            grupo.categoria.forEach(cat => {
                cat.subcategoria.forEach(sub => {
                    subcategoriaFiltrado.push({
                        chave: sub.chave,
                        nome: sub.nome,
                        categoria: cat.nome,
                        categoriaChave: cat.chave,
                        grupo: grupo.grupo,
                        grupoChave: grupo.grupo.toLowerCase().replace(/ /g, '_')
                    });
                });
            });
        });

        return{
            gruposFiltrados: gruposFiltrados, 
            categoriaFiltrado: categoriaFiltrado,
            subcategoriaFiltrado: subcategoriaFiltrado
        };
    } catch (err) {
        console.error('Erro ao buscar grupos:', err.message);
        res.status(500).json({ erro: err.message });
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