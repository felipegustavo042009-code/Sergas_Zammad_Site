import jwt from 'jsonwebtoken';
import User from './modelo/user.js';
import zammad from './zammadConeccao.js';

const SECRET = process.env.JWT_SECRET;

export async function login(email, senha) {
    try {
        const usuario = await User.findOne({ email });

        if (!usuario) {
            throw new Error('Credenciais inválidas');
        }

        const senhaValida = await usuario.compararSenha(senha);

        if (!senhaValida) {
            throw new Error('Credenciais inválidas');
        }

        const token = jwt.sign(
            {
                email: usuario.email,
                nome: usuario.nome,
                userId: usuario._id,
                zammadId: usuario.zammadId
            },
            SECRET,
            { expiresIn: '4h' }
        );

        return token;
    } catch (error) {
        throw new Error('Credenciais inválidas');
    }
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

        return {
            id: novoUsuario._id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            zammadId: novoUsuario.zammadId
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
