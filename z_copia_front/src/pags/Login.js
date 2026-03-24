import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import "../css/login.css";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");

    async function formSubmit(e) {
        e.preventDefault();
        console.log("CHAMOU SUBMIT");

        const url = isLogin
            ? "http://localhost:3000/login"
            : "http://localhost:3000/register";

        const varivelEnviar = isLogin
            ? { email, senha }
            : { nome, email, senha, confirmSenha };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(varivelEnviar),
        });

        const data = await response.json();
        console.log(data);
    };

    return (
        <div className="login_fundoTotal">
            <div className="login_fundoLogo">
                <div className="login_logo">
                    <img src={logo} alt="Logo" />
                    <p>Bem-vindo ao Zammad</p>
                    <Link to='/'>Voltar para Home</Link>
                    <Link to='/ticket'>Tickeds</Link>
                </div>
            </div>

            <div className="login_fundoForm">
                <h2>{isLogin ? "Login" : "Cadastro"}</h2>

                <form className="login_form" onSubmit={formSubmit}>

                    {!isLogin ? <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    /> : null}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />

                    {!isLogin ? <input
                        type="password"
                        placeholder="Confirmar Senha"
                        value={confirmSenha}
                        onChange={(e) => setConfirmSenha(e.target.value)}
                    /> : null}

                    <button type="submit">
                        {isLogin ? "Entrar" : "Cadastrar"}
                    </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin
                        ? "Não tem conta? Cadastre-se"
                        : "Já tem conta? Faça login"}
                </button>
            </div>
        </div>
    );
}