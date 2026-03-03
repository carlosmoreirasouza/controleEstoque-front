const API_STORAGE_KEY = 'controle_estoque_api_base_url';

const apiInput = document.getElementById('apiBaseUrl');
const apiStatus = document.getElementById('apiStatus');
const produtoLista = document.getElementById('produtoLista');
const desejoLista = document.getElementById('desejoLista');

const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

function getApiBaseUrl() {
  return localStorage.getItem(API_STORAGE_KEY) || '';
}

function setApiBaseUrl(value) {
  localStorage.setItem(API_STORAGE_KEY, value);
}

function notify(message) {
  apiStatus.textContent = message;
}

function selectTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabName);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabName);
  });
}

async function request(path, options = {}) {
  const baseUrl = getApiBaseUrl();

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

function renderProdutos(items) {
  produtoLista.innerHTML = '';

  if (!items.length) {
    produtoLista.innerHTML = '<li>Nenhum produto cadastrado.</li>';
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.nome} | SKU: ${item.sku} | Qtd: ${item.quantidade} | Preço: R$ ${Number(item.preco).toFixed(2)}`;
    produtoLista.appendChild(li);
  });
}

function renderDesejos(items) {
  desejoLista.innerHTML = '';

  if (!items.length) {
    desejoLista.innerHTML = '<li>Nenhum item na lista de desejos.</li>';
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.nome} | Prioridade: ${item.prioridade} ${item.observacao ? `| ${item.observacao}` : ''}`;
    desejoLista.appendChild(li);
  });
}

async function carregarProdutos() {
  try {
    const data = await request('/produtos');
    renderProdutos(Array.isArray(data) ? data : []);
  } catch (error) {
    renderProdutos([]);
    notify(`Falha ao carregar produtos: ${error.message}`);
  }
}

async function carregarDesejos() {
  try {
    const data = await request('/lista-desejos');
    renderDesejos(Array.isArray(data) ? data : []);
  } catch (error) {
    renderDesejos([]);
    notify(`Falha ao carregar lista de desejos: ${error.message}`);
  }
}

document.getElementById('saveApiBaseUrl').addEventListener('click', () => {
  const value = apiInput.value.trim();
  setApiBaseUrl(value);
  notify(value ? 'URL da API salva com sucesso.' : 'URL da API removida.');
});

document.getElementById('produtoForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const payload = {
    nome: formData.get('nome'),
    sku: formData.get('sku'),
    quantidade: Number(formData.get('quantidade')),
    preco: Number(formData.get('preco')),
  };

  try {
    await request('/produtos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    event.currentTarget.reset();
    notify('Produto cadastrado com sucesso.');
    await carregarProdutos();
  } catch (error) {
    notify(`Erro ao cadastrar produto: ${error.message}`);
  }
});

document.getElementById('desejoForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const payload = {
    nome: formData.get('nome'),
    prioridade: formData.get('prioridade'),
    observacao: formData.get('observacao'),
  };

  try {
    await request('/lista-desejos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    event.currentTarget.reset();
    notify('Item da lista de desejos cadastrado com sucesso.');
    await carregarDesejos();
  } catch (error) {
    notify(`Erro ao cadastrar item da lista de desejos: ${error.message}`);
  }
});

document.getElementById('refreshProdutos').addEventListener('click', carregarProdutos);
document.getElementById('refreshDesejos').addEventListener('click', carregarDesejos);

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectTab(button.dataset.tab);
  });
});

apiInput.value = getApiBaseUrl();
notify(apiInput.value ? 'URL da API carregada do armazenamento local.' : 'Defina a URL base da API para começar.');

carregarProdutos();
carregarDesejos();
