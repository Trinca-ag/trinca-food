import { useState, useEffect } from 'react';
import { 
  buscarPedidosPorPeriodo, 
  calcularMetricas, 
  agruparVendasPorDia, 
  agruparVendasPorHora,
  getTopProdutos 
} from '../../services/relatoriosService';
import { formatarMoeda } from '../../utils/formatters';
import { 
  getInicioFimDia, 
  getInicioFimSemana, 
  getInicioFimMes, 
  getUltimosDias, 
  formatarDataBR 
} from '../../utils/dateHelpers';
import { exportarRelatorioPDF } from '../../utils/pdfExport';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import toast from 'react-hot-toast';
import './Dashboard.css';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('hoje');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [metricas, setMetricas] = useState(null);
  const [vendasPorDia, setVendasPorDia] = useState([]);
  const [vendasPorHora, setVendasPorHora] = useState([]);
  const [topProdutos, setTopProdutos] = useState([]);
  
  // Comparação de períodos
  const [compararPeriodos, setCompararPeriodos] = useState(false);
  const [metricasComparacao, setMetricasComparacao] = useState(null);
  const [periodoTexto, setPeriodoTexto] = useState('');

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  async function carregarDados() {
    try {
      setLoading(true);
      
      let inicio, fim, textoCompleto;

      switch (periodo) {
        case 'hoje':
          ({ inicio, fim } = getInicioFimDia());
          textoCompleto = `Hoje - ${formatarDataBR(inicio)}`;
          break;
        case 'semana':
          ({ inicio, fim } = getInicioFimSemana());
          textoCompleto = `Esta Semana - ${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`;
          break;
        case 'mes':
          ({ inicio, fim } = getInicioFimMes());
          textoCompleto = `Este Mês - ${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`;
          break;
        case 'ultimos7':
          ({ inicio, fim } = getUltimosDias(7));
          textoCompleto = `Últimos 7 Dias - ${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`;
          break;
        case 'ultimos30':
          ({ inicio, fim } = getUltimosDias(30));
          textoCompleto = `Últimos 30 Dias - ${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`;
          break;
        case 'customizado':
          if (!dataInicio || !dataFim) return;
          inicio = new Date(dataInicio);
          fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          textoCompleto = `${formatarDataBR(inicio)} a ${formatarDataBR(fim)}`;
          break;
        default:
          ({ inicio, fim } = getInicioFimDia());
          textoCompleto = `Hoje - ${formatarDataBR(inicio)}`;
      }

      setPeriodoTexto(textoCompleto);

      const pedidos = await buscarPedidosPorPeriodo(inicio, fim);
      const metricasCalculadas = calcularMetricas(pedidos);
      const vendas = agruparVendasPorDia(pedidos);
      const vendasHora = agruparVendasPorHora(pedidos);
      const produtos = getTopProdutos(pedidos, 5);

      setMetricas(metricasCalculadas);
      setVendasPorDia(vendas);
      setVendasPorHora(vendasHora);
      setTopProdutos(produtos);

      // Comparação de períodos (se ativado)
      if (compararPeriodos) {
        await carregarComparacao(inicio, fim);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarComparacao(inicioAtual, fimAtual) {
    try {
      // Calcular período anterior (mesmo tamanho)
      const diferencaDias = Math.ceil((fimAtual - inicioAtual) / (1000 * 60 * 60 * 24));
      
      const inicioAnterior = new Date(inicioAtual);
      inicioAnterior.setDate(inicioAnterior.getDate() - diferencaDias);
      
      const fimAnterior = new Date(fimAtual);
      fimAnterior.setDate(fimAnterior.getDate() - diferencaDias);

      const pedidosAnterior = await buscarPedidosPorPeriodo(inicioAnterior, fimAnterior);
      const metricasAnterior = calcularMetricas(pedidosAnterior);

      setMetricasComparacao(metricasAnterior);
    } catch (error) {
      console.error('Erro ao carregar comparação:', error);
      setMetricasComparacao(null);
    }
  }

  function handlePeriodoChange(novoPeriodo) {
    setPeriodo(novoPeriodo);
    if (novoPeriodo !== 'customizado') {
      setDataInicio('');
      setDataFim('');
    }
  }

  function handleBuscarCustomizado() {
    if (!dataInicio || !dataFim) {
      toast.error('Selecione as datas de início e fim');
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      toast.error('Data inicial não pode ser maior que a data final');
      return;
    }

    carregarDados();
  }

  function handleExportarPDF() {
    if (!metricas) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      exportarRelatorioPDF(
        {
          metricas,
          vendasPorDia,
          topProdutos
        },
        periodoTexto
      );
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
      console.error(error);
    }
  }

  function toggleComparacao() {
    const novoValor = !compararPeriodos;
    setCompararPeriodos(novoValor);
    
    if (novoValor) {
      carregarDados();
    } else {
      setMetricasComparacao(null);
    }
  }

  function calcularVariacao(valorAtual, valorAnterior) {
    if (!valorAnterior) return 0;
    return ((valorAtual - valorAnterior) / valorAnterior) * 100;
  }

  const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  // Preparar dados para o gráfico de pizza
  const dadosFormasPagamento = metricas?.formasPagamento 
    ? Object.entries(metricas.formasPagamento).map(([nome, valor]) => ({
        name: nome,
        value: valor
      }))
    : [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Dashboard de Vendas</h1>
        <div className="dashboard-actions">
          <button 
            className={`btn-comparar ${compararPeriodos ? 'active' : ''}`}
            onClick={toggleComparacao}
            title="Comparar com período anterior"
          >
            📊 {compararPeriodos ? 'Ocultar Comparação' : 'Comparar Períodos'}
          </button>
          <button 
            className="btn-exportar"
            onClick={handleExportarPDF}
            title="Exportar relatório em PDF"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="periodo-filtros">
        <button 
          className={periodo === 'hoje' ? 'periodo-btn active' : 'periodo-btn'}
          onClick={() => handlePeriodoChange('hoje')}
        >
          Hoje
        </button>
        <button 
          className={periodo === 'semana' ? 'periodo-btn active' : 'periodo-btn'}
          onClick={() => handlePeriodoChange('semana')}
        >
          Esta Semana
        </button>
        <button 
          className={periodo === 'mes' ? 'periodo-btn active' : 'periodo-btn'}
          onClick={() => handlePeriodoChange('mes')}
        >
          Este Mês
        </button>
        <button 
          className={periodo === 'ultimos7' ? 'periodo-btn active' : 'periodo-btn'}
          onClick={() => handlePeriodoChange('ultimos7')}
        >
          Últimos 7 Dias
        </button>
        <button 
          className={periodo === 'ultimos30' ? 'periodo-btn active' : 'periodo-btn'}
          onClick={() => handlePeriodoChange('ultimos30')}
        >
          Últimos 30 Dias
        </button>
        <button 
          className={periodo === 'customizado' ? 'periodo-btn active' : 'periodo-btn'}
          onClick={() => handlePeriodoChange('customizado')}
        >
          Personalizado
        </button>
      </div>

      {/* Filtro Customizado */}
      {periodo === 'customizado' && (
        <div className="filtro-customizado">
          <div className="data-group">
            <label>Data Início:</label>
            <input 
              type="date" 
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="data-group">
            <label>Data Fim:</label>
            <input 
              type="date" 
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleBuscarCustomizado}>
            Buscar
          </button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="metricas-grid">
        <div className="metrica-card vendas">
          <div className="metrica-icon">💰</div>
          <div className="metrica-info">
            <h3>{formatarMoeda(metricas?.totalVendas || 0)}</h3>
            <p>Total em Vendas</p>
            {compararPeriodos && metricasComparacao && (
              <span className={`variacao ${calcularVariacao(metricas.totalVendas, metricasComparacao.totalVendas) >= 0 ? 'positiva' : 'negativa'}`}>
                {calcularVariacao(metricas.totalVendas, metricasComparacao.totalVendas) >= 0 ? '↑' : '↓'} 
                {Math.abs(calcularVariacao(metricas.totalVendas, metricasComparacao.totalVendas)).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="metrica-card pedidos">
          <div className="metrica-icon">📦</div>
          <div className="metrica-info">
            <h3>{metricas?.totalPedidos || 0}</h3>
            <p>Total de Pedidos</p>
            {compararPeriodos && metricasComparacao && (
              <span className={`variacao ${calcularVariacao(metricas.totalPedidos, metricasComparacao.totalPedidos) >= 0 ? 'positiva' : 'negativa'}`}>
                {calcularVariacao(metricas.totalPedidos, metricasComparacao.totalPedidos) >= 0 ? '↑' : '↓'} 
                {Math.abs(calcularVariacao(metricas.totalPedidos, metricasComparacao.totalPedidos)).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="metrica-card ticket">
          <div className="metrica-icon">🎫</div>
          <div className="metrica-info">
            <h3>{formatarMoeda(metricas?.ticketMedio || 0)}</h3>
            <p>Ticket Médio</p>
            {compararPeriodos && metricasComparacao && (
              <span className={`variacao ${calcularVariacao(metricas.ticketMedio, metricasComparacao.ticketMedio) >= 0 ? 'positiva' : 'negativa'}`}>
                {calcularVariacao(metricas.ticketMedio, metricasComparacao.ticketMedio) >= 0 ? '↑' : '↓'} 
                {Math.abs(calcularVariacao(metricas.ticketMedio, metricasComparacao.ticketMedio)).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="metrica-card concluidos">
          <div className="metrica-icon">✅</div>
          <div className="metrica-info">
            <h3>{metricas?.pedidosConcluidos || 0}</h3>
            <p>Pedidos Concluídos</p>
            {compararPeriodos && metricasComparacao && (
              <span className={`variacao ${calcularVariacao(metricas.pedidosConcluidos, metricasComparacao.pedidosConcluidos) >= 0 ? 'positiva' : 'negativa'}`}>
                {calcularVariacao(metricas.pedidosConcluidos, metricasComparacao.pedidosConcluidos) >= 0 ? '↑' : '↓'} 
                {Math.abs(calcularVariacao(metricas.pedidosConcluidos, metricasComparacao.pedidosConcluidos)).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="info-grid">
        <div className="info-card">
          <h3>🚚 Tipo de Entrega</h3>
          <div className="info-content">
            <div className="info-item">
              <span>Entregas:</span>
              <strong>{metricas?.entregas || 0}</strong>
            </div>
            <div className="info-item">
              <span>Retiradas:</span>
              <strong>{metricas?.retiradas || 0}</strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>💳 Pagamento Mais Usado</h3>
          <div className="info-content">
            <div className="destaque-info">
              {metricas?.formaPagamentoMaisUsada || 'Nenhum'}
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>⏳ Status dos Pedidos</h3>
          <div className="info-content">
            <div className="info-item">
              <span>Em Andamento:</span>
              <strong>{metricas?.pedidosEmAndamento || 0}</strong>
            </div>
            <div className="info-item">
              <span>Concluídos:</span>
              <strong>{metricas?.pedidosConcluidos || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="graficos-container">
        {/* Gráfico de Linha - Vendas por Dia */}
        {vendasPorDia.length > 0 && (
          <div className="grafico-card grafico-full">
            <h3>📈 Vendas por Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={vendasPorDia}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data" 
                  tickFormatter={(data) => formatarDataBR(new Date(data))}
                />
                <YAxis tickFormatter={(valor) => `R$ ${valor.toFixed(0)}`} />
                <Tooltip 
                  formatter={(valor) => formatarMoeda(valor)}
                  labelFormatter={(data) => formatarDataBR(new Date(data))}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#e74c3c" 
                  fillOpacity={1}
                  fill="url(#colorValor)"
                  strokeWidth={3}
                  name="Valor (R$)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Vendas por Hora */}
        {vendasPorHora.some(v => v.quantidade > 0) && (
          <div className="grafico-card grafico-full">
            <h3>🕐 Vendas por Hora do Dia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip 
                  formatter={(valor, name) => {
                    if (name === 'valor') return formatarMoeda(valor);
                    return valor;
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade" fill="#3498db" name="Pedidos" />
                <Bar dataKey="valor" fill="#27ae60" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Barras - Top Produtos */}
        {topProdutos.length > 0 && (
          <div className="grafico-card">
            <h3>🏆 Top 5 Produtos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProdutos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#3498db" name="Quantidade Vendida" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Pizza - Formas de Pagamento */}
        {dadosFormasPagamento.length > 0 && (
          <div className="grafico-card">
            <h3>💳 Formas de Pagamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosFormasPagamento}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosFormasPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Mensagem quando não há dados */}
      {metricas?.totalPedidos === 0 && (
        <div className="sem-dados">
          <h3>📭 Nenhum pedido neste período</h3>
          <p>Selecione outro período para visualizar os dados</p>
        </div>
      )}
    </div>
  );
}