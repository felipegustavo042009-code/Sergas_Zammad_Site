import express from 'express';
import { authMiddleware, pegarGrupos, criarTicket } from './funcoesTickeds.js';
import { login, criarUsuario, buscarUsuarioPorEmail } from './auth.js';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }

        const token = await login(email, senha);

        res.json({ token });
    } catch (err) {
        res.status(401).json({ erro: err.message });
    }
});

app.post('/register', async (req, res) => {
    try {
        console.log('Dados recebidos para registro:', req.body);
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: 'Nome, email e senha são obrigatórios'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ erro: 'Email inválido' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
        }

        const usuario = await criarUsuario(nome, email, senha);

        res.status(201).json({
            ok: true,
            message: 'Usuário criado com sucesso',
            usuario
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/ticket', authMiddleware, async (req, res) => {
    try {
        const { mensagem } = req.body;

        if (!mensagem) {
            return res.status(400).json({ erro: 'Mensagem é obrigatória' });
        }

        const user = req.user;

        const data = await criarTicket(
            user.nome,
            user.email,
            mensagem
        );

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/grupos', authMiddleware, async (req, res) => {
    try {
        const data = await pegarGrupos();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/usuario', authMiddleware, async (req, res) => {
    try {
        const usuario = await buscarUsuarioPorEmail(req.user.email);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.json({
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            zammadId: usuario.zammadId,
            createdAt: usuario.createdAt
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(PORT, () => {
    pegarGrupos().then(grupos => {
        console.log('Grupos disponíveis no Zammad:');
    }).catch(err => {
        console.error('Erro ao pegar grupos:', err.message);
    });
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});