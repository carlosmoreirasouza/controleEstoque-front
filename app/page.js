'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

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

  const [produtoForm, setProdutoForm] = useState({ nome: '', caracteristicasGerais: '', categoria: '' });
  const [desejoForm, setDesejoForm] = useState({ email: '', telefone: '', itemDesejado: '', prioridade: '' });

  const [produtoFiltro, setProdutoFiltro] = useState('todos');
  const [desejoFiltro, setDesejoFiltro] = useState('todos');

  const produtosVisiveis = useMemo(
    () => produtos.filter((item) => produtoFiltro === 'todos' || item.categoria === produtoFiltro),
    [produtos, produtoFiltro]
  );

  const desejosVisiveis = useMemo(
    () => desejos.filter((item) => desejoFiltro === 'todos' || item.prioridade === desejoFiltro),
    [desejos, desejoFiltro]
  );

  async function request(path, options = {}) {
    if (!apiBaseUrl) throw new Error('Configure NEXT_PUBLIC_API_URL (ou api_url) para continuar.');

    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function handleProdutoSubmit(event) {
    event.preventDefault();
    const payload = { ...produtoForm };

    try {
      const response = await request('/api/estoque', { method: 'POST', body: JSON.stringify(payload) });
      setProdutos((prev) => [{ ...payload, ...response }, ...prev]);
      setProdutoForm({ nome: '', caracteristicasGerais: '', categoria: '' });
      setStatus('Item de estoque cadastrado com sucesso.');
    } catch (error) {
      setStatus(`Erro ao cadastrar item de estoque: ${error.message}`);
    }
  }

  async function handleDesejoSubmit(event) {
    event.preventDefault();
    const payload = { ...desejoForm };

    try {
      const response = await request('/api/desejos', { method: 'POST', body: JSON.stringify(payload) });
      setDesejos((prev) => [{ ...payload, ...response }, ...prev]);
      setDesejoForm({ email: '', telefone: '', itemDesejado: '', prioridade: '' });
      setStatus('Item da lista de desejos cadastrado com sucesso.');
    } catch (error) {
      setStatus(`Erro ao cadastrar item da lista de desejos: ${error.message}`);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={2} mb={2}>
        <Typography variant="overline" color="primary" fontWeight={700}>
          Painel de gestão
        </Typography>
        <Typography variant="h4">Controle de Estoque</Typography>
        <Typography color="text.secondary">Integração com API de estoque e lista de desejos.</Typography>
      </Stack>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuração da API
              </Typography>
              <Typography variant="body2" mb={1}>
                URL base configurada: <strong>{apiBaseUrl || 'não configurada'}</strong>
              </Typography>
              <Alert severity={apiBaseUrl ? 'success' : 'warning'}>{status}</Alert>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Itens cadastrados</Typography>
              <Typography variant="h4">{produtos.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Desejos cadastrados</Typography>
              <Typography variant="h4">{desejos.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable">
            {TAB_ITEMS.map((tab) => (
              <Tab key={tab.key} value={tab.key} label={tab.label} />
            ))}
          </Tabs>
          <Divider sx={{ my: 2 }} />

          {activeTab === 'produtos' && (
            <Stack spacing={2}>
              <Typography variant="h6">Cadastro de Item no Estoque</Typography>
              <Box component="form" onSubmit={handleProdutoSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Nome"
                      value={produtoForm.nome}
                      onChange={(event) => setProdutoForm((prev) => ({ ...prev, nome: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl required>
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        label="Categoria"
                        value={produtoForm.categoria}
                        onChange={(event) => setProdutoForm((prev) => ({ ...prev, categoria: event.target.value }))}
                      >
                        <MenuItem value="eletronicos">Eletrônicos</MenuItem>
                        <MenuItem value="escritorio">Escritório</MenuItem>
                        <MenuItem value="mercado">Mercado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      multiline
                      minRows={3}
                      label="Características gerais"
                      value={produtoForm.caracteristicasGerais}
                      onChange={(event) =>
                        setProdutoForm((prev) => ({ ...prev, caracteristicasGerais: event.target.value }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained">
                      Cadastrar item em estoque
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Typography variant="subtitle1">Filtro de categoria</Typography>
                <FormControl sx={{ maxWidth: 260 }}>
                  <InputLabel>Categoria</InputLabel>
                  <Select value={produtoFiltro} label="Categoria" onChange={(e) => setProdutoFiltro(e.target.value)}>
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="eletronicos">Eletrônicos</MenuItem>
                    <MenuItem value="escritorio">Escritório</MenuItem>
                    <MenuItem value="mercado">Mercado</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Typography variant="h6">Histórico local de itens cadastrados</Typography>
              <List>
                {produtosVisiveis.length
                  ? produtosVisiveis.map((item, index) => (
                      <ListItem key={`${item.nome}-${index}`} divider>
                        <ListItemText
                          primary={item.nome}
                          secondary={item.caracteristicasGerais}
                        />
                        <Chip label={item.categoria || 'sem categoria'} color="primary" variant="outlined" />
                      </ListItem>
                    ))
                  : <ListItem><ListItemText primary={EMPTY_MESSAGE.produtos} /></ListItem>}
              </List>
            </Stack>
          )}

          {activeTab === 'desejos' && (
            <Stack spacing={2}>
              <Typography variant="h6">Cadastro Lista de Desejos</Typography>
              <Box component="form" onSubmit={handleDesejoSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="E-mail"
                      type="email"
                      value={desejoForm.email}
                      onChange={(event) => setDesejoForm((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Telefone"
                      value={desejoForm.telefone}
                      onChange={(event) => setDesejoForm((prev) => ({ ...prev, telefone: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Item desejado"
                      value={desejoForm.itemDesejado}
                      onChange={(event) => setDesejoForm((prev) => ({ ...prev, itemDesejado: event.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl required>
                      <InputLabel>Prioridade</InputLabel>
                      <Select
                        label="Prioridade"
                        value={desejoForm.prioridade}
                        onChange={(event) => setDesejoForm((prev) => ({ ...prev, prioridade: event.target.value }))}
                      >
                        <MenuItem value="alta">Alta</MenuItem>
                        <MenuItem value="media">Média</MenuItem>
                        <MenuItem value="baixa">Baixa</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="secondary">
                      Cadastrar desejo
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Typography variant="subtitle1">Filtro de prioridade</Typography>
                <FormControl sx={{ maxWidth: 260 }}>
                  <InputLabel>Prioridade</InputLabel>
                  <Select value={desejoFiltro} label="Prioridade" onChange={(e) => setDesejoFiltro(e.target.value)}>
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="alta">Alta</MenuItem>
                    <MenuItem value="media">Média</MenuItem>
                    <MenuItem value="baixa">Baixa</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Typography variant="h6">Histórico local de desejos cadastrados</Typography>
              <List>
                {desejosVisiveis.length
                  ? desejosVisiveis.map((item, index) => (
                      <ListItem key={`${item.email}-${item.itemDesejado}-${index}`} divider>
                        <ListItemText
                          primary={item.itemDesejado}
                          secondary={`E-mail: ${item.email} | Telefone: ${item.telefone}`}
                        />
                        <Chip label={item.prioridade || 'sem prioridade'} color="secondary" variant="outlined" />
                      </ListItem>
                    ))
                  : <ListItem><ListItemText primary={EMPTY_MESSAGE.desejos} /></ListItem>}
              </List>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
