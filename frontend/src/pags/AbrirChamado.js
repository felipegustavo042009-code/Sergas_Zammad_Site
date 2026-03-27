// src/pags/AbrirChamado.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/abrirChamado.css';

function AbrirChamado() {
    const navigate = useNavigate();
    const [estagio, setEstagio] = useState(1);
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [ticketNumber, setTicketNumber] = useState(null);

    // Dados do formulário
    const [formData, setFormData] = useState({
        // Dados pessoais
        cidade: '',
        bairro: '',
        rua: '',

        // Categoria e subcategoria
        categoria: '',
        subcategoria: '',
        grupo: '',

        // Detalhes
        assunto: '',
        descricao: ''
    });

    const [grupos, setGrupos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
    const [subcategoriasDisponiveis, setSubcategoriasDisponiveis] = useState([]);

    const token = localStorage.getItem('tokenUsuario');

    // useEffect(() => {
    //     if (!token) {
    //         navigate('/login');
    //     }
    // }, [token, navigate]);

    useEffect(() => {
        const fetchCategorias = async () => {
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
            fetchCategorias();
        }
    }, [token]);

    // Atualizar categorias quando grupo mudar
    useEffect(() => {
        if (formData.grupo) {
            const cats = categorias.filter(c => c.grupoChave === formData.grupo);
            setCategoriasDisponiveis(cats);
        } else {
            setCategoriasDisponiveis([]);
        }
    }, [formData.grupo, categorias]);

    // Atualizar subcategorias quando categoria mudar
    useEffect(() => {
        if (formData.categoria) {
            const subcats = subcategorias.filter(s => s.categoriaChave === formData.categoria);
            setSubcategoriasDisponiveis(subcats);
        } else {
            setSubcategoriasDisponiveis([]);
        }
    }, [formData.categoria, subcategorias]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoriaSelect = (categoriaChave) => {
        setFormData(prev => ({ ...prev, categoria: categoriaChave, subcategoria: '' }));
    };

    const handleSubcategoriaSelect = (subcategoriaChave) => {
        setFormData(prev => ({ ...prev, subcategoria: subcategoriaChave }));
    };

    const nextEstagio = () => {
        if (estagio === 1) {
            if (!formData.cidade || !formData.bairro || !formData.rua) {
                alert('Preencha todos os campos obrigatórios');
                return;
            }
            setEstagio(2);
        } else if (estagio === 2) {
            if (!formData.grupo || !formData.categoria) {
                alert('Selecione grupo e categoria');
                return;
            }
            setEstagio(3);
        } else if (estagio === 3) {
            if (!formData.assunto || !formData.descricao) {
                alert('Preencha assunto e descrição');
                return;
            }
            if (formData.descricao.length < 30 || formData.assunto.length < 10) {
                alert('Descrição deve ter no mínimo 30 caracteres e assunto 10 caracteres');
                return;
            }
            setEstagio(4);
        }
    };

    const prevStagio = () => {
        if (estagio > 1) setEstagio(estagio - 1);
    };

    const submitTicket = async () => {
        setLoading(true);
        try {
            const mensagemCompleta = `
                **Dados do Solicitante**
                Cidade: ${formData.cidade || 'Não informada'}
                Bairro: ${formData.bairro || 'Não informado'}
                Rua: ${formData.rua || 'Não informada'}

                **Classificação**
                Grupo: ${grupos.find(g => g.chave === formData.grupo)?.nome || formData.grupo}
                Categoria: ${categorias.find(c => c.chave === formData.categoria)?.nome || formData.categoria}
                Subcategoria: ${subcategorias.find(s => s.chave === formData.subcategoria)?.nome || formData.subcategoria || 'Não informada'}

                **Solicitação**
                Assunto: ${formData.assunto}
                Descrição: ${formData.descricao}
            `;

            const response = await fetch('http://localhost:3000/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mensagem: mensagemCompleta,
                    titulo: formData.assunto,
                    grupo: formData.grupo,
                    categoria: formData.categoria,
                    subcategoria: formData.subcategoria
                })
            });

            const data = await response.json();

            if (response.ok) {
                setTicketNumber(data.number || `#${Math.floor(Math.random() * 10000)}`);
                setSuccessModal(true);
                setFormData({
                    cidade: '',
                    bairro: '',
                    rua: '',
                    categoria: '',
                    subcategoria: '',
                    grupo: '',
                    assunto: '',
                    descricao: ''
                });
                setEstagio(1);
            } else {
                alert('Erro ao enviar chamado: ' + data.erro);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const getStepClass = (stepNumber) => {
        if (estagio > stepNumber) return 'done';
        if (estagio === stepNumber) return 'active';
        return 'idle';
    };

    return (
        <div className="abrir-chamado">
            <header>
                <div className="header-stripe"></div>
                <div className="header-inner">
                    <a className="brand" href="/">
                        <div className="brand-mark">SG</div>
                        <div className="brand-text">
                            <strong>SERGAS</strong>
                            <small>Companhia de Gás de Sergipe</small>
                        </div>
                    </a>
                    <div className="header-right">
                        <a className="header-link" href="/">Início</a>
                        <button className="header-link logout-btn" onClick={() => {
                            localStorage.removeItem('tokenUsuario');
                            navigate('/login');
                        }}>Sair</button>
                        <div className="header-phone">
                            <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            0800 284 5236
                        </div>
                    </div>
                </div>
            </header>

            <div className="hero">
                <div className="hero-badge">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    Central de Atendimento
                </div>
                <h1>Abrir um <span>Novo Chamado</span></h1>
                <p>Registre sua solicitação ou relato de problema. Nossa equipe entrará em contato em breve.</p>
            </div>

            <div className="steps-bar">
                <div className="steps-inner">
                    <div className={`step ${getStepClass(1)}`}>
                        <div className="step-num">1</div>
                        <div className="step-info">
                            <div className="step-label">Identificação</div>
                            <div className="step-sub">Seus dados</div>
                        </div>
                    </div>
                    <div className={`step ${getStepClass(2)}`}>
                        <div className="step-num">2</div>
                        <div className="step-info">
                            <div className="step-label">Categoria</div>
                            <div className="step-sub">Tipo de serviço</div>
                        </div>
                    </div>
                    <div className={`step ${getStepClass(3)}`}>
                        <div className="step-num">3</div>
                        <div className="step-info">
                            <div className="step-label">Detalhes</div>
                            <div className="step-sub">Descrição completa</div>
                        </div>
                    </div>
                    <div className={`step ${getStepClass(4)}`}>
                        <div className="step-num">4</div>
                        <div className="step-info">
                            <div className="step-label">Confirmação</div>
                            <div className="step-sub">Revisar e enviar</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-wrap">
                <div className="form-card">
                    {estagio === 1 && (
                        <div className="form-section">
                            <div className="section-heading">
                                <div className="section-icon blue">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <div>
                                    <div className="section-title">Seus Dados</div>
                                    <div className="section-desc">Precisamos de suas informações para o contato</div>
                                </div>
                            </div>

                            <div className="field-row cols-3">
                                <div className="field">
                                    <label>Cidade</label>
                                    <select name="cidade" value={formData.cidade} onChange={handleInputChange}>
                                        <option value="">Selecione...</option>
                                        <option>Aracaju</option>
                                        <option>Nossa Senhora do Socorro</option>
                                        <option>São Cristóvão</option>
                                        <option>Laranjeiras</option>
                                        <option>Carmópolis</option>
                                        <option>Estância</option>
                                        <option>Lagarto</option>
                                        <option>Barra dos Coqueiros</option>
                                        <option>Itaporanga d'Ajuda</option>
                                        <option>Outra</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Bairro</label>
                                    <input type="text" name="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Ex: Farolândia" />
                                </div>
                                <div className="field">
                                    <label>Rua</label>
                                    <input type="text" name="rua" value={formData.rua} onChange={handleInputChange} placeholder="Ex: Avenida/Rua Monteiro Lobato" />
                                </div>
                            </div>
                        </div>
                    )}

                    {estagio === 2 && (
                        <div className="form-section">
                            <div className="section-heading">
                                <div className="section-icon orange">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </div>
                                <div>
                                    <div className="section-title">Classificação</div>
                                    <div className="section-desc">Selecione o grupo e categoria da sua solicitação</div>
                                </div>
                            </div>

                            <div className="field">
                                <label>Grupo <span className="required">*</span></label>
                                <select name="grupo" value={formData.grupo} onChange={handleInputChange}>
                                    <option value="">Selecione um grupo...</option>
                                    {grupos.map(g => (
                                        <option key={g.chave} value={g.chave}>{g.nome}</option>
                                    ))}
                                </select>
                            </div>

                            {categoriasDisponiveis.length > 0 && (
                                <div className="field">
                                    <label>Categoria <span className="required">*</span></label>
                                    <div className="category-grid">
                                        {categoriasDisponiveis.map(cat => (
                                            <label
                                                key={cat.chave}
                                                className={`cat-card ${formData.categoria === cat.chave ? 'selected' : ''}`}
                                                onClick={() => handleCategoriaSelect(cat.chave)}
                                            >
                                                <div className="cat-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                                                <div className="cat-label">{cat.nome}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {subcategoriasDisponiveis.length > 0 && (
                                <div className="field">
                                    <label>Subcategoria</label>
                                    <div className="category-grid">
                                        {subcategoriasDisponiveis.map(sub => (
                                            <label
                                                key={sub.chave}
                                                className={`cat-card ${formData.subcategoria === sub.chave ? 'selected' : ''}`}
                                                onClick={() => handleSubcategoriaSelect(sub.chave)}
                                            >
                                                <div className="cat-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>
                                                <div className="cat-label">{sub.nome}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {estagio === 3 && (
                        <div className="form-section">
                            <div className="section-heading">
                                <div className="section-icon gray">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                </div>
                                <div>
                                    <div className="section-title">Detalhes da Solicitação</div>
                                    <div className="section-desc">Quanto mais detalhes, mais rápido será o atendimento</div>
                                </div>
                            </div>

                            <div className="field">
                                <label>Assunto <span className="required">*</span></label>
                                <input type="text" name="assunto" value={formData.assunto} onChange={handleInputChange} placeholder="Resumo em até 80 caracteres" />
                            </div>

                            <div className="field">
                                <label>Descrição completa <span className="required">*</span></label>
                                <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível. Informe local exato, horário do ocorrido, etc."></textarea>
                                <div className="field-hint">Mínimo 30 caracteres. Inclua o endereço completo se for uma ocorrência em campo.</div>
                            </div>
                        </div>
                    )}

                    {estagio === 4 && (
                        <div className="form-section">
                            <div className="section-heading">
                                <div className="section-icon blue">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <div>
                                    <div className="section-title">Confirmar Dados</div>
                                    <div className="section-desc">Revise as informações antes de enviar</div>
                                </div>
                            </div>

                            <div className="confirmacao-card">
                                <div className="confirmacao-section">
                                    <h4>Dados de Localização</h4>
                                    <p><strong>Cidade:</strong> {formData.cidade || 'Não informada'}</p>
                                    <p><strong>Bairro:</strong> {formData.bairro || 'Não informado'}</p>
                                    <p><strong>Rua:</strong> {formData.rua || 'Não informada'}</p>
                                </div>

                                <div className="confirmacao-section">
                                    <h4>Classificação</h4>
                                    <p><strong>Grupo:</strong> {grupos.find(g => g.chave === formData.grupo)?.nome || formData.grupo}</p>
                                    <p><strong>Categoria:</strong> {categorias.find(c => c.chave === formData.categoria)?.nome || formData.categoria}</p>
                                    <p><strong>Subcategoria:</strong> {subcategorias.find(s => s.chave === formData.subcategoria)?.nome || formData.subcategoria || 'Não informada'}</p>
                                </div>

                                <div className="confirmacao-section">
                                    <h4>Solicitação</h4>
                                    <p><strong>Assunto:</strong> {formData.assunto}</p>
                                    <p><strong>Descrição:</strong> {formData.descricao}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-footer">
                        <div className="footer-note">
                            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Seus dados estão protegidos pela LGPD
                        </div>
                        <div className="footer-btns">
                            {estagio > 1 && (
                                <button className="btn btn-ghost" onClick={prevStagio}>
                                    ←  Voltar
                                </button>
                            )}
                            {estagio < 4 ? (
                                <button className="btn btn-submit" onClick={nextEstagio}>
                                    Continuar  →
                                </button>
                            ) : (
                                <button className="btn btn-submit" onClick={submitTicket} disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar Chamado'}
                                    <svg viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <aside className="sidebar">
                    <div className="emergency-box">
                        <svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        <h4>Emergência de Gás?</h4>
                        <p>Em caso de vazamento ou cheiro forte, ligue imediatamente:</p>
                        <span className="emergency-number">0800 284 7976</span>
                        <div className="emergency-sub">Plantão 24 horas — gratuito</div>
                    </div>

                    <div className="info-card">
                        <div className="info-header">
                            <div className="info-header-icon" style={{ background: '#E8F2FB' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#004F8B"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <div className="info-title">Tempo de Resposta</div>
                        </div>
                        <div className="info-body">
                            <div className="sla-item">
                                <div className="sla-color" style={{ background: '#CF3A3A' }}></div>
                                <div><div className="sla-name">Alta prioridade</div><div className="sla-time">Até 4 horas úteis</div></div>
                            </div>
                            <div className="sla-item">
                                <div className="sla-color" style={{ background: '#E6960A' }}></div>
                                <div><div className="sla-name">Média prioridade</div><div className="sla-time">Até 24 horas úteis</div></div>
                            </div>
                            <div className="sla-item">
                                <div className="sla-color" style={{ background: '#17955A' }}></div>
                                <div><div className="sla-name">Baixa prioridade</div><div className="sla-time">Até 72 horas úteis</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-header">
                            <div className="info-header-icon" style={{ background: '#FEF3EB' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#F47B20"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <div className="info-title">Dicas Importantes</div>
                        </div>
                        <div className="info-body">
                            <ul className="tip-list">
                                <li>Informe o endereço completo para agilizar o atendimento em campo.</li>
                                <li>Anexe fotos se houver danos visíveis ou situação anormal.</li>
                                <li>Guarde o número do protocolo para acompanhar sua solicitação.</li>
                                <li>Nosso horário de atendimento é de seg. a sex., 08h às 17h30.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>

            <div className={`success-overlay ${successModal ? 'show' : ''}`}>
                <div className="success-card">
                    <div className="success-ring">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <h2>Chamado Registrado!</h2>
                    <p>Seu chamado foi recebido com sucesso. Guarde seu número de protocolo para acompanhamento.</p>
                    <div className="ticket-code">{ticketNumber}</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>
                        Você receberá uma confirmação no e-mail informado. Nossa equipe entrará em contato dentro do prazo da prioridade selecionada.
                    </p>
                    <div className="success-actions">
                        <button className="btn btn-blue" onClick={() => {
                            setSuccessModal(false);
                            navigate('/');
                        }}>
                            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            Voltar ao Início
                        </button>
                        <button className="btn btn-ghost" onClick={() => setSuccessModal(false)}>
                            Abrir outro chamado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AbrirChamado;