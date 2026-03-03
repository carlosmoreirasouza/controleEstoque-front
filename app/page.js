'use client';

import { useEffect, useState } from 'react';

const API_STORAGE_KEY = 'controle_estoque_api_base_url';

const TAB_ITEMS = [
  { key: 'produtos', label: 'Cadastro de Produto' },
  { key: 'baixa', label: 'Baixa de Produto' },
  { key: 'desejos', label: 'Cadastro Lista de Desejos' },
];

const EMPTY_MESSAGE = {
  produtos: 'Nenhum produto cadastrado.',
  baixa: 'Nenhuma baixa registrada.',
  desejos: 'Nenhum item na lista de desejos.',
};

export default function HomePage() {
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [status, setStatus] = useState('Defina a URL da API para começar.');
  const [activeTab, setActiveTab] = useState('produtos');

  const [produtos, setProdutos] = useState([]);
  const [baixas, setBaixas] = useState([]);
  const [desejos, setDesejos] = useState([]);

  const [produtoForm, setProdutoForm] = useState({ nome: '', sku: '', quantidade: '', preco: '' });
  const [baixaForm, setBaixaForm] = useState({ sku: '', quantidade: '', motivo: '' });
  const [desejoForm, setDesejoForm] = useState({ nome: '', prioridade: 'baixa', observacao: '' });

  useEffect(() => {
    const savedApi = window.localStorage.getItem(API_STORAGE_KEY) || '';
    setApiBaseUrl(savedApi);

    if (savedApi) {
      Promise.all([carregarProdutos(savedApi), carregarBaixas(savedApi), carregarDesejos(savedApi)]);
    }
  }, []);

  async function request(path, options = {}, baseUrlOverride) {
    const baseUrl = (baseUrlOverride ?? apiBaseUrl).trim();

    if (!baseUrl) {
      throw new Error('Configure a URL base da API antes de continuar.');
    }

    const url = `${baseUrl.replace(/\/$/, '')}${path}`;
    const response = await fetch(url, {
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

  async function carregarProdutos(baseUrl) {
    try {
      const data = await request('/produtos', {}, baseUrl);
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      setProdutos([]);
      setStatus(`Falha ao carregar produtos: ${error.message}`);
    }
  }

  async function carregarBaixas(baseUrl) {
    try {
      const data = await request('/produtos/baixas', {}, baseUrl);
      setBaixas(Array.isArray(data) ? data : []);
    } catch (error) {
      setBaixas([]);
      setStatus(`Falha ao carregar baixas de produtos: ${error.message}`);
    }
  }

  async function carregarDesejos(baseUrl) {
    try {
      const data = await request('/lista-desejos', {}, baseUrl);
      setDesejos(Array.isArray(data) ? data : []);
    } catch (error) {
      setDesejos([]);
      setStatus(`Falha ao carregar lista de desejos: ${error.message}`);
    }
  }

  function saveApiBaseUrl() {
    const value = apiBaseUrl.trim();
    window.localStorage.setItem(API_STORAGE_KEY, value);
    setStatus(value ? 'URL da API salva com sucesso.' : 'URL da API removida.');

    if (value) {
      Promise.all([carregarProdutos(value), carregarBaixas(value), carregarDesejos(value)]);
    } else {
      setProdutos([]);
      setBaixas([]);
      setDesejos([]);
    }
  }

  async function handleProdutoSubmit(event) {
    event.preventDefault();

    const payload = {
      nome: produtoForm.nome,
      sku: produtoForm.sku,
      quantidade: Number(produtoForm.quantidade),
      preco: Number(produtoForm.preco),
    };

    try {
      await request('/produtos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setProdutoForm({ nome: '', sku: '', quantidade: '', preco: '' });
      setStatus('Produto cadastrado com sucesso.');
      await carregarProdutos();
    } catch (error) {
      setStatus(`Erro ao cadastrar produto: ${error.message}`);
    }
  }

  async function handleBaixaSubmit(event) {
    event.preventDefault();

    const payload = {
      sku: baixaForm.sku,
      quantidade: Number(baixaForm.quantidade),
      motivo: baixaForm.motivo.trim() || null,
    };

    try {
      await request('/produtos/baixas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setBaixaForm({ sku: '', quantidade: '', motivo: '' });
      setStatus('Baixa de produto registrada com sucesso.');
      await Promise.all([carregarProdutos(), carregarBaixas()]);
    } catch (error) {
      setStatus(`Erro ao registrar baixa de produto: ${error.message}`);
    }
  }

  async function handleDesejoSubmit(event) {
    event.preventDefault();

    const payload = {
      nome: desejoForm.nome,
      prioridade: desejoForm.prioridade,
      observacao: desejoForm.observacao,
    };

    try {
      await request('/lista-desejos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setDesejoForm({ nome: '', prioridade: 'baixa', observacao: '' });
      setStatus('Item da lista de desejos cadastrado com sucesso.');
      await carregarDesejos();
    } catch (error) {
      setStatus(`Erro ao cadastrar item da lista de desejos: ${error.message}`);
    }
  }

  function renderList(type, items) {
    if (!items.length) {
      return <li>{EMPTY_MESSAGE[type]}</li>;
    }

    if (type === 'produtos') {
      return items.map((item) => (
        <li key={`${item.sku}-${item.nome}`}>
          {item.nome} | SKU: {item.sku} | Qtd: {item.quantidade} | Preço: R$ {Number(item.preco).toFixed(2)}
        </li>
      ));
    }

    if (type === 'baixa') {
      return items.map((item, index) => {
        const data = item.data ? new Date(item.data).toLocaleString('pt-BR') : 'Data não informada';
        return (
          <li key={`${item.sku}-${item.data || index}`}>
            SKU: {item.sku} | Qtd baixa: {item.quantidade} | Data: {data}
            {item.motivo ? ` | Motivo: ${item.motivo}` : ''}
          </li>
        );
      });
    }

    return items.map((item, index) => (
      <li key={`${item.nome}-${item.prioridade}-${index}`}>
        {item.nome} | Prioridade: {item.prioridade} {item.observacao ? `| ${item.observacao}` : ''}
      </li>
    ));
  }

  return (
    <>
      <header>
        <h1>Controle de Estoque</h1>
        <p>Front-end para integração com API de produtos e lista de desejos.</p>
      </header>

      <main>
        <section className="card">
          <h2>Configuração da API</h2>
          <label htmlFor="apiBaseUrl">URL base da API (ex.: http://localhost:3000)</label>
          <div className="inline">
            <input
              id="apiBaseUrl"
              type="url"
              placeholder="http://localhost:3000"
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
            />
            <button type="button" onClick={saveApiBaseUrl}>
              Salvar URL
            </button>
          </div>
          <small role="status">{status}</small>
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
            <h2>Cadastro de Produto</h2>
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
                SKU
                <input
                  name="sku"
                  type="text"
                  required
                  value={produtoForm.sku}
                  onChange={(event) => setProdutoForm((prev) => ({ ...prev, sku: event.target.value }))}
                />
              </label>

              <label>
                Quantidade
                <input
                  name="quantidade"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={produtoForm.quantidade}
                  onChange={(event) => setProdutoForm((prev) => ({ ...prev, quantidade: event.target.value }))}
                />
              </label>

              <label>
                Preço
                <input
                  name="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={produtoForm.preco}
                  onChange={(event) => setProdutoForm((prev) => ({ ...prev, preco: event.target.value }))}
                />
              </label>

              <button type="submit">Cadastrar Produto</button>
            </form>

            <h3>Produtos cadastrados</h3>
            <button type="button" className="secondary" onClick={() => carregarProdutos()}>
              Atualizar lista
            </button>
            <ul className="list">{renderList('produtos', produtos)}</ul>
          </section>
        )}

        {activeTab === 'baixa' && (
          <section className="card">
            <h2>Baixa de Produto</h2>
            <form onSubmit={handleBaixaSubmit}>
              <label>
                SKU do produto
                <input
                  name="sku"
                  type="text"
                  required
                  value={baixaForm.sku}
                  onChange={(event) => setBaixaForm((prev) => ({ ...prev, sku: event.target.value }))}
                />
              </label>

              <label>
                Quantidade para baixa
                <input
                  name="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={baixaForm.quantidade}
                  onChange={(event) => setBaixaForm((prev) => ({ ...prev, quantidade: event.target.value }))}
                />
              </label>

              <label>
                Motivo (opcional)
                <textarea
                  name="motivo"
                  rows="3"
                  placeholder="Ex.: venda, avaria, consumo interno"
                  value={baixaForm.motivo}
                  onChange={(event) => setBaixaForm((prev) => ({ ...prev, motivo: event.target.value }))}
                />
              </label>

              <button type="submit">Registrar baixa</button>
            </form>

            <h3>Baixas registradas</h3>
            <button type="button" className="secondary" onClick={() => carregarBaixas()}>
              Atualizar lista
            </button>
            <ul className="list">{renderList('baixa', baixas)}</ul>
          </section>
        )}

        {activeTab === 'desejos' && (
          <section className="card">
            <h2>Cadastro Lista de Desejos</h2>
            <form onSubmit={handleDesejoSubmit}>
              <label>
                Nome do item
                <input
                  name="nome"
                  type="text"
                  required
                  value={desejoForm.nome}
                  onChange={(event) => setDesejoForm((prev) => ({ ...prev, nome: event.target.value }))}
                />
              </label>

              <label>
                Prioridade
                <select
                  name="prioridade"
                  required
                  value={desejoForm.prioridade}
                  onChange={(event) => setDesejoForm((prev) => ({ ...prev, prioridade: event.target.value }))}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </label>

              <label>
                Observação
                <textarea
                  name="observacao"
                  rows="3"
                  value={desejoForm.observacao}
                  onChange={(event) => setDesejoForm((prev) => ({ ...prev, observacao: event.target.value }))}
                />
              </label>

              <button type="submit">Cadastrar Desejo</button>
            </form>

            <h3>Itens da lista de desejos</h3>
            <button type="button" className="secondary" onClick={() => carregarDesejos()}>
              Atualizar lista
            </button>
            <ul className="list">{renderList('desejos', desejos)}</ul>
          </section>
        )}
      </main>
    </>
  );
}
