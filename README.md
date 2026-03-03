# Controle de Estoque Front (Next.js)

Aplicação front-end em **Node.js + Next.js** para consumir uma API de controle de estoque.

## Funcionalidades

- Configurar URL base da API e salvar no navegador (`localStorage`).
- Tela de cadastro de produto.
- Tela de baixa de produto (retirada do estoque).
- Tela de cadastro de item da lista de desejos.
- Listagem de produtos, baixas e itens da lista de desejos.

## Contrato esperado da API

### Produtos
- `GET /produtos` -> retorna array de produtos.
- `POST /produtos` -> cadastra um produto com payload:

```json
{
  "nome": "Produto A",
  "sku": "SKU001",
  "quantidade": 10,
  "preco": 12.5
}
```

### Baixa de produtos
- `GET /produtos/baixas` -> retorna array de baixas registradas.
- `POST /produtos/baixas` -> registra uma baixa com payload:

```json
{
  "sku": "SKU001",
  "quantidade": 2,
  "motivo": "venda"
}
```

### Lista de desejos
- `GET /lista-desejos` -> retorna array de desejos.
- `POST /lista-desejos` -> cadastra um item com payload:

```json
{
  "nome": "Teclado Mecânico",
  "prioridade": "alta",
  "observacao": "Modelo ABNT2"
}
```

## Executar localmente

```bash
npm install
npm run dev
```

Depois abra `http://localhost:3000`.

## Scripts

- `npm run dev` inicia o ambiente de desenvolvimento.
- `npm run build` gera build de produção.
- `npm run start` sobe aplicação em produção.
- `npm run lint` executa verificação de lint.
