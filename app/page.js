'use client';

import { useMemo, useState } from 'react';

const TAB_ITEMS = [
  { key: 'produtos', label: 'Cadastro de Item no Estoque' },
  { key: 'desejos', label: 'Cadastro Lista de Desejos' },
];

const EMPTY_MESSAGE = {
  produtos: 'Nenhum item cadastrado no histórico local.',
  desejos: 'Nenhum desejo cadastrado no histórico local.',
};

export default function HomePage() {
  const apiBaseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL || process.env.api_url || '').trim().replace(/\/$/, ''),
    []
  );

  const [status, setStatus] = useState(
    apiBaseUrl
      ? 'API configurada via variável de ambiente.'
      : 'Defina NEXT_PUBLIC_API_URL (ou api_url) no ambiente para habilitar os cadastros.'
  );
  const [activeTab, setActiveTab] = useState('produtos');

  const [produtos, setProdutos] = useState([]);
  const [desejos, setDesejos] = useState([]);

  const [produtoForm, setProdutoForm] = useState({ nome: '', caracteristicasGerais: '' });
  const [desejoForm, setDesejoForm] = useState({ email: '', telefone: '', itemDesejado: '' });

  async function request(path, options = {}) {
    if (!apiBaseUrl) {
      throw new Error('Configure NEXT_PUBLIC_API_URL (ou api_url) para continuar.');
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function handleProdutoSubmit(event) {
    event.preventDefault();

    const payload = {
      nome: produtoForm.nome,
      caracteristicasGerais: produtoForm.caracteristicasGerais,
    };

    try {
      const response = await request('/api/estoque', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setProdutos((prev) => [{ ...payload, ...response }, ...prev]);
      setProdutoForm({ nome: '', caracteristicasGerais: '' });
      setStatus('Item de estoque cadastrado com sucesso.');
    } catch (error) {
      setStatus(`Erro ao cadastrar item de estoque: ${error.message}`);
    }
  }

  async function handleDesejoSubmit(event) {
    event.preventDefault();

    const payload = {
      email: desejoForm.email,
      telefone: desejoForm.telefone,
      itemDesejado: desejoForm.itemDesejado,
    };

    try {
      const response = await request('/api/desejos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setDesejos((prev) => [{ ...payload, ...response }, ...prev]);
      setDesejoForm({ email: '', telefone: '', itemDesejado: '' });
      setStatus('Item da lista de desejos cadastrado com sucesso.');
    } catch (error) {
      setStatus(`Erro ao cadastrar item da lista de desejos: ${error.message}`);
    }
  }

  function renderList(type, items) {
    if (!items.length) {
      return <li>{EMPTY_MESSAGE[type]}</li>;
    }

    if (type === 'produtos') {
      return items.map((item, index) => (
        <li key={`${item.nome}-${index}`}>
          {item.nome}
          {item.caracteristicasGerais ? ` | ${item.caracteristicasGerais}` : ''}
        </li>
      ));
    }

    return items.map((item, index) => (
      <li key={`${item.email}-${item.itemDesejado}-${index}`}>
        {item.itemDesejado} | E-mail: {item.email} | Telefone: {item.telefone}
      </li>
    ));
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Painel de gestão</p>
          <h1>Controle de Estoque</h1>
          <p>Integração com API de estoque e lista de desejos.</p>
        </div>
      </header>

      <main className="page-content">
        <section className="card api-card">
          <h2>Configuração da API</h2>
          <p>
            URL base configurada por variável de ambiente: <strong>{apiBaseUrl || 'não configurada'}</strong>
          </p>
          <small role="status">{status}</small>
        </section>

        <section className="overview-grid" aria-label="Resumo rápido do estoque">
          <article className="overview-card">
            <span>Itens cadastrados</span>
            <strong>{produtos.length}</strong>
          </article>
          <article className="overview-card">
            <span>Desejos cadastrados</span>
            <strong>{desejos.length}</strong>
          </article>
        </section>

        <nav className="tabs" aria-label="Abas de funcionalidades">
          {TAB_ITEMS.map((tab) => (
            <button
              type="button"
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              key={tab.key}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'produtos' && (
          <section className="card">
            <h2>Cadastro de Item no Estoque</h2>
            <form onSubmit={handleProdutoSubmit}>
              <label>
                Nome
                <input
                  name="nome"
                  type="text"
                  required
                  value={produtoForm.nome}
                  onChange={(event) => setProdutoForm((prev) => ({ ...prev, nome: event.target.value }))}
                />
              </label>

              <label>
                Características gerais
                <textarea
                  name="caracteristicasGerais"
                  rows="3"
                  required
                  value={produtoForm.caracteristicasGerais}
                  onChange={(event) =>
                    setProdutoForm((prev) => ({ ...prev, caracteristicasGerais: event.target.value }))
                  }
                />
              </label>

              <button type="submit">Cadastrar item em estoque</button>
            </form>

            <h3>Histórico local de itens cadastrados</h3>
            <ul className="list">{renderList('produtos', produtos)}</ul>
          </section>
        )}

        {activeTab === 'desejos' && (
          <section className="card">
            <h2>Cadastro Lista de Desejos</h2>
            <form onSubmit={handleDesejoSubmit}>
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  value={desejoForm.email}
                  onChange={(event) => setDesejoForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>

              <label>
                Telefone
                <input
                  name="telefone"
                  type="tel"
                  required
                  value={desejoForm.telefone}
                  onChange={(event) => setDesejoForm((prev) => ({ ...prev, telefone: event.target.value }))}
                />
              </label>

              <label>
                Item desejado
                <input
                  name="itemDesejado"
                  type="text"
                  required
                  value={desejoForm.itemDesejado}
                  onChange={(event) => setDesejoForm((prev) => ({ ...prev, itemDesejado: event.target.value }))}
                />
              </label>

              <button type="submit">Cadastrar desejo</button>
            </form>

            <h3>Histórico local de desejos cadastrados</h3>
            <ul className="list">{renderList('desejos', desejos)}</ul>
          </section>
        )}
      </main>
    </div>
  );
}
