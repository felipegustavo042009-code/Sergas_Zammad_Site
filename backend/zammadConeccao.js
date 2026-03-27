import axios from 'axios';
import 'dotenv/config';
import mongoose from 'mongoose';

const zammad = axios.create({
    baseURL: `https://${process.env.linkZammad}/api/v1`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado com sucesso'))
    .catch(err => console.error('❌ Erro ao conectar MongoDB:', err));

export default zammad;