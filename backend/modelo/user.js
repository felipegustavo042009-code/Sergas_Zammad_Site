import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    senha: {
        type: String,
        required: true
    },
    zammadId: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function () {
    if (!this.isModified('senha')) return;

    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
});

userSchema.methods.compararSenha = async function (senha) {
    return await bcrypt.compare(senha, this.senha);
};

export default mongoose.model('User', userSchema);