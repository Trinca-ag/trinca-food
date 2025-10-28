import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const pedidosCollection = collection(db, 'pedidos');

// Buscar pedidos por período
export async function buscarPedidosPorPeriodo(dataInicio, dataFim) {
  try {
    const inicio = Timestamp.fromDate(dataInicio);
    const fim = Timestamp.fromDate(dataFim);

    const q = query(
      pedidosCollection,
      where('createdAt', '>=', inicio),
      where('createdAt', '<=', fim),
      where('status', 'in', ['concluido', 'em_preparo', 'saiu_para_entrega', 'pronto_para_retirada', 'aceito'])
    );

    const querySnapshot = await getDocs(q);
    
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return pedidos;
  } catch (error) {
    console.error('Erro ao buscar pedidos por período:', error);
    throw error;
  }
}

// Calcular métricas do período
export function calcularMetricas(pedidos) {
  const totalPedidos = pedidos.length;
  
  const totalVendas = pedidos.reduce((acc, pedido) => {
    return acc + (pedido.valorTotal || 0);
  }, 0);

  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;

  // Pedidos por status
  const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido').length;
  const pedidosEmAndamento = pedidos.filter(p => 
    ['em_preparo', 'saiu_para_entrega', 'pronto_para_retirada', 'aceito'].includes(p.status)
  ).length;

  // Forma de pagamento mais usada
  const formasPagamento = {};
  pedidos.forEach(pedido => {
    const forma = pedido.formaPagamento || 'Não informado';
    formasPagamento[forma] = (formasPagamento[forma] || 0) + 1;
  });

  const formaPagamentoMaisUsada = Object.keys(formasPagamento).length > 0
    ? Object.entries(formasPagamento).sort((a, b) => b[1] - a[1])[0][0]
    : 'Nenhum';

  // Tipo de entrega
  const entregas = pedidos.filter(p => p.tipoRetirada === 'entrega').length;
  const retiradas = pedidos.filter(p => p.tipoRetirada === 'retirada').length;

  return {
    totalPedidos,
    totalVendas,
    ticketMedio,
    pedidosConcluidos,
    pedidosEmAndamento,
    formaPagamentoMaisUsada,
    entregas,
    retiradas,
    formasPagamento
  };
}

// Agrupar vendas por dia
export function agruparVendasPorDia(pedidos) {
  const vendasPorDia = {};

  pedidos.forEach(pedido => {
    const data = pedido.createdAt.toDate();
    const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!vendasPorDia[dataStr]) {
      vendasPorDia[dataStr] = {
        data: dataStr,
        valor: 0,
        quantidade: 0
      };
    }

    vendasPorDia[dataStr].valor += pedido.valorTotal || 0;
    vendasPorDia[dataStr].quantidade += 1;
  });

  return Object.values(vendasPorDia).sort((a, b) => 
    new Date(a.data) - new Date(b.data)
  );
}

// Top produtos mais vendidos
export function getTopProdutos(pedidos, limite = 5) {
  const produtosCount = {};

  pedidos.forEach(pedido => {
    if (pedido.itens && Array.isArray(pedido.itens)) {
      pedido.itens.forEach(item => {
        const nomeProduto = typeof item === 'string' ? item : item.nome || 'Produto';
        produtosCount[nomeProduto] = (produtosCount[nomeProduto] || 0) + 1;
      });
    }
  });

  return Object.entries(produtosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([nome, quantidade]) => ({ nome, quantidade }));
}

// Agrupar vendas por hora
export function agruparVendasPorHora(pedidos) {
  const vendasPorHora = {};

  // Inicializar todas as horas (0-23)
  for (let hora = 0; hora < 24; hora++) {
    vendasPorHora[hora] = {
      hora: `${String(hora).padStart(2, '0')}:00`,
      valor: 0,
      quantidade: 0
    };
  }

  pedidos.forEach(pedido => {
    const data = pedido.createdAt.toDate();
    const hora = data.getHours();

    vendasPorHora[hora].valor += pedido.valorTotal || 0;
    vendasPorHora[hora].quantidade += 1;
  });

  return Object.values(vendasPorHora);
}