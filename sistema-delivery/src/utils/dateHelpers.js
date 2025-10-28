// Obter início e fim do dia
export function getInicioFimDia(data = new Date()) {
  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);
  
  const fim = new Date(data);
  fim.setHours(23, 59, 59, 999);
  
  return { inicio, fim };
}

// Obter início e fim da semana
export function getInicioFimSemana(data = new Date()) {
  const inicio = new Date(data);
  const dia = inicio.getDay();
  const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar para segunda-feira
  
  inicio.setDate(diff);
  inicio.setHours(0, 0, 0, 0);
  
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  
  return { inicio, fim };
}

// Obter início e fim do mês
export function getInicioFimMes(data = new Date()) {
  const inicio = new Date(data.getFullYear(), data.getMonth(), 1);
  inicio.setHours(0, 0, 0, 0);
  
  const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0);
  fim.setHours(23, 59, 59, 999);
  
  return { inicio, fim };
}

// Obter últimos N dias
export function getUltimosDias(dias = 7) {
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);
  
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - (dias - 1));
  inicio.setHours(0, 0, 0, 0);
  
  return { inicio, fim };
}

// Formatar data para string (dd/mm/yyyy)
export function formatarDataBR(data) {
  if (!data) return '';
  
  const d = data instanceof Date ? data : new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

// Obter nome do mês
export function getNomeMes(mes) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes];
}

// Obter dias do mês
export function getDiasDoMes(data = new Date()) {
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  
  const dias = [];
  for (let dia = primeiroDia.getDate(); dia <= ultimoDia.getDate(); dia++) {
    dias.push(new Date(ano, mes, dia));
  }
  
  return dias;
}