// auth.js
import jwt from 'jsonwebtoken';
import User from './modelo/user.js';
import zammad from './zammadConeccao.js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    console.error('ERRO: JWT_SECRET não está configurado');
    throw new Error('JWT_SECRET não configurado');
}


export async function login(email, senha) {
    try {
        await zammad.post('/signin', {
            username: email,
            password: senha
        });

        const response = await zammad.get('/users/me');
        const usuario = response.data;

        const token = gerarToken({
            id: usuario.id,
            email: usuario.email,
            nome: usuario.firstname
        });

        return {
            token,
            usuario
        };

    } catch (error) {
        console.log('Error: ', error)
        throw new Error('Credenciais inválidas');
    }
}
 

function gerarToken(usuario) {
    return jwt.sign(
        {
            email: usuario.email,
            nome: usuario.nome,
            userId: usuario._id,
            zammadId: usuario.zammadId
        },
        SECRET,
        { expiresIn: '4h' }
    );
}

export function verificarToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        throw new Error('Token inválido');
    }
}

export async function criarUsuario(nome, email, senha) {
    try {
        const usuarioExistente = await User.findOne({ email });

        if (usuarioExistente) {
            throw new Error('Usuário já existe');
        }

        let zammadUser = null;
        try {
            const [firstname, ...rest] = nome.split(' ');
            const lastname = rest.join(' ') || 'User';

            const res = await zammad.post('/users', {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: senha
            });

            zammadUser = res.data;
        } catch (error) {
            console.error('Erro ao criar usuário no Zammad:', error.message);
            throw new Error('Erro ao criar usuário no Zammad');
        }

        const novoUsuario = new User({
            nome,
            email,
            senha,
            zammadId: zammadUser.id
        });

        await novoUsuario.save();

        // Gerar token para o novo usuário
        const token = gerarToken(novoUsuario);

        return {
            usuario: {
                id: novoUsuario._id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                zammadId: novoUsuario.zammadId
            },
            token  // Retorna o token junto com os dados do usuário
        };
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        throw error;
    }
}

export async function buscarUsuarioPorEmail(email) {
    return await User.findOne({ email });
}

export async function buscarUsuarioPorId(id) {
    return await User.findById(id);
}