# Controle de Estoque Front

Aplicação web simples para consumir uma API de controle de estoque.

## Funcionalidades

- Configurar URL base da API e salvar no navegador.
- Tela de cadastro de produto.
- Tela de cadastro de item da lista de desejos.
- Listagem de produtos e itens da lista de desejos.

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

Como é um projeto estático, basta servir os arquivos:

```bash
python3 -m http.server 4173
```

Depois abra `http://localhost:4173`.
