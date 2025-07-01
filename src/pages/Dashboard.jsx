import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Radio,
  RadioGroup,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getResult } from '../api';

const columns = {
  produto: ["produto.codigo", "produto.nome", "produto.nutriscore", "produto.novascore", "produto.ecoscore"],
  categoria: ["categoria.nome"],
  marca: ["marca.nome"],
  ingrediente: ["ingrediente.nome", "ingrediente.vegano", "ingrediente.vegetariano"],
  nutriente: ["nutriente.nome", "nutriente.unidade"],
  tag: ["tag.nome", "tag.tipo"]
};

const operadores = [
  { label: "igual (=)", value: "=" },
  { label: "diferente (!=)", value: "!=" },
  { label: "maior (>)", value: ">" },
  { label: "menor (<)", value: "<" },
  { label: "parecido (LIKE)", value: "like" }
];

const agregacoesDisponiveis = ["count", "avg", "sum", "min", "max"];

const Dashboard = () => {
  const [activeTables, setActiveTables] = useState(["produto"]);
  const [selectedColumns, setSelectedColumns] = useState(columns["produto"]);
  const [filters, setFilters] = useState([]);
  const [agregacoes, setAgregacoes] = useState([]);
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(100);
  const [orderBy, setOrderBy] = useState("");

  const handleColChange = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleTableToggle = (table) => {
    const isActive = activeTables.includes(table);

    if (isActive) {
      // desmarcar
      const newTables = activeTables.filter(t => t !== table);
      setActiveTables(newTables);

      // atualiza colunas
      let newColumns = [];
      newTables.forEach(t => {
        newColumns = [...newColumns, ...columns[t]];
      });
      setSelectedColumns(newColumns);
    } else {
      // ao marcar
      if (table === 'produto') {
        // se marcar produto — libera múltiplas
        setActiveTables(['produto']);
        setSelectedColumns(columns['produto']);
      } else {
        if (activeTables.includes('produto')) {
          // produto ativo — permite adicionar mais
          const newTables = [...activeTables, table];
          setActiveTables(newTables);
          setSelectedColumns(prev => [...prev, ...columns[table]]);
        } else {
          // sem produto ativo — permite só essa tabela
          setActiveTables([table]);
          setSelectedColumns(columns[table]);
        }
      }
    }
  };


  const updateFilter = (idx, key, value) => {
    const updated = [...filters];
    updated[idx][key] = value;
    setFilters(updated);
  };

  const removeFilter = (idx) => {
    setFilters(filters.filter((_, i) => i !== idx));
  };

  const addFilter = () => {
    setFilters([...filters, {
      logica: "AND",
      campo: selectedColumns[0],
      operador: "=",
      valor: ""
    }]);
  };

  const updateAgreg = (idx, key, value) => {
    const updated = [...agregacoes];
    updated[idx][key] = value;
    setAgregacoes(updated);
  };

  const removeAgreg = (idx) => {
    setAgregacoes(agregacoes.filter((_, i) => i !== idx));
  };

  const addAgreg = () => {
    setAgregacoes([...agregacoes, { tipo: "count", campo: selectedColumns[0] }]);
  };

  const gerarRelatorio = async () => {
    setData([]);
    const mappedAggregations = {};
    agregacoes.forEach((agg, i) => {
      mappedAggregations[`agg.campo`] = [agg.tipo, agg.campo];
    });

    const mappedFilters = filters.map(f => ({
      logic: f.logica.toLowerCase(),
      column: f.campo,
      operator: f.operador,
      value: f.valor
    }));

    const result = await getResult({
      tables: activeTables,
      columns: selectedColumns,
      aggregations: mappedAggregations,
      filters: mappedFilters,
      limit,
      orderBy
    });

    setData(result);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Relatórios OpenFoodFacts
      </Typography>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {Object.keys(columns).map((tableKey) => (
          <Button
            key={tableKey}
            variant={activeTables.includes(tableKey) ? "contained" : "outlined"}
            onClick={() => handleTableToggle(tableKey)}
          >
            {tableKey}
          </Button>
        ))}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {filters.map((filter, idx) => (
            <Box key={idx} display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
              <FormControl>
                <InputLabel>Lógica</InputLabel>
                <Select
                  value={filter.logica}
                  label="Lógica"
                  onChange={(e) => updateFilter(idx, 'logica', e.target.value)}
                >
                  <MenuItem value="AND">AND</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Campo</InputLabel>
                <Select
                  value={filter.campo}
                  label="Campo"
                  onChange={(e) => updateFilter(idx, 'campo', e.target.value)}
                >
                  {selectedColumns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Operador</InputLabel>
                <Select
                  value={filter.operador}
                  label="Operador"
                  onChange={(e) => updateFilter(idx, 'operador', e.target.value)}
                >
                  {operadores.map(op => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Valor"
                value={filter.valor}
                onChange={(e) => updateFilter(idx, 'valor', e.target.value)}
                sx={{ width: 120 }}
              />
              <IconButton color="error" onClick={() => removeFilter(idx)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={addFilter}>+ Filtro</Button>
        </CardContent>
      </Card>

      <Box display="flex" gap={4} mb={4} flexWrap="wrap" justifyContent={'space-between'}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>Colunas</Typography>
          {Object.values(columns).flat().map(col => (
            <FormControlLabel
              key={col}
              control={
                <Checkbox
                  checked={selectedColumns.includes(col)}
                  onChange={() => handleColChange(col)}
                />
              }
              label={col}
            />
          ))}
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>Agregações</Typography>
          {agregacoes.map((agg, idx) => (
            <Box key={idx} display="flex" gap={2} mb={1} alignItems="center">
              <FormControl>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={agg.tipo}
                  label="Tipo"
                  onChange={(e) => updateAgreg(idx, 'tipo', e.target.value)}
                >
                  {agregacoesDisponiveis.map(tipo => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Campo</InputLabel>
                <Select
                  value={agg.campo}
                  label="Campo"
                  onChange={(e) => updateAgreg(idx, 'campo', e.target.value)}
                >
                  {selectedColumns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                </Select>
              </FormControl>
              <IconButton color="error" onClick={() => removeAgreg(idx)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={addAgreg}>+ Agregação</Button>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={4}>
        <TextField
          label="LIMIT"
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        />
        <TextField
          label="ORDER BY"
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
        />
      </Box>

      <Button variant="contained" fullWidth sx={{ mb: 4 }} onClick={gerarRelatorio}>
        Gerar Relatório
      </Button>

      <Card>
        <CardContent>
          {data.length === 0 ? (
            <Typography align="center" variant="body1">Nenhum dado encontrado para os critérios selecionados.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {selectedColumns.map(col => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    {selectedColumns.map(col => {
                      const value = item[col.toLowerCase()];
                      const displayValue = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value ?? '';
                      return <TableCell key={col}>{displayValue}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
