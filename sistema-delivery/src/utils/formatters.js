// Formatar valor em Real (BRL)
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Formatar data e hora
export function formatarDataHora(timestamp) {
  if (!timestamp) return '';
  
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(data);
}

// Formatar apenas data
export function formatarData(timestamp) {
  if (!timestamp) return '';
  
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(data);
}

// Formatar apenas hora
export function formatarHora(timestamp) {
  if (!timestamp) return '';
  
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(data);
}

// Obter status em português
export function obterStatusTexto(status) {
  const statusMap = {
    'pendente': 'Aguardando Confirmação',
    'aceito': 'Pedido Aceito',
    'em_preparo': 'Em Preparo',
    'saiu_para_entrega': 'Saiu para Entrega',
    'pronto_para_retirada': 'Pronto para Retirada',
    'concluido': 'Concluído',
    'recusado': 'Recusado'
  };
  
  return statusMap[status] || status;
}

// Obter cor do status
export function obterCorStatus(status) {
  const coresMap = {
    'pendente': '#f39c12',
    'aceito': '#3498db',
    'em_preparo': '#9b59b6',
    'saiu_para_entrega': '#1abc9c',
    'pronto_para_retirada': '#16a085',
    'concluido': '#27ae60',
    'recusado': '#e74c3c'
  };
  
  return coresMap[status] || '#95a5a6';
}