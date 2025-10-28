import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarMoeda, formatarDataHora } from './formatters';

export function exportarRelatorioPDF(dados, periodo) {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(231, 76, 60); // Cor primary
  doc.text('Relatório de Vendas', 105, 20, { align: 'center' });
  
  // Período
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Período: ${periodo}`, 105, 30, { align: 'center' });
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${formatarDataHora(new Date())}`, 105, 37, { align: 'center' });
  
  // Linha separadora
  doc.setDrawColor(231, 76, 60);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);
  
  let yPosition = 50;
  
  // Métricas Principais
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Métricas Principais', 20, yPosition);
  yPosition += 10;
  
  const metricas = [
    ['Total em Vendas', formatarMoeda(dados.metricas.totalVendas)],
    ['Total de Pedidos', dados.metricas.totalPedidos.toString()],
    ['Ticket Médio', formatarMoeda(dados.metricas.ticketMedio)],
    ['Pedidos Concluídos', dados.metricas.pedidosConcluidos.toString()],
    ['Pedidos em Andamento', dados.metricas.pedidosEmAndamento.toString()],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: metricas,
    theme: 'striped',
    headStyles: { fillColor: [231, 76, 60] },
    margin: { left: 20, right: 20 },
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Informações Adicionais
  doc.setFontSize(14);
  doc.text('Informações Adicionais', 20, yPosition);
  yPosition += 10;
  
  const info = [
    ['Entregas', dados.metricas.entregas.toString()],
    ['Retiradas', dados.metricas.retiradas.toString()],
    ['Forma de Pagamento Mais Usada', dados.metricas.formaPagamentoMaisUsada],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Informação', 'Valor']],
    body: info,
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] },
    margin: { left: 20, right: 20 },
  });
  
  yPosition = doc.lastAutoTable.finalY + 15;
  
  // Top Produtos
  if (dados.topProdutos.length > 0) {
    // Nova página se necessário
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Top 5 Produtos Mais Vendidos', 20, yPosition);
    yPosition += 10;
    
    const produtosBody = dados.topProdutos.map((p, index) => [
      `${index + 1}º`,
      p.nome,
      p.quantidade.toString()
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Posição', 'Produto', 'Quantidade']],
      body: produtosBody,
      theme: 'striped',
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 20, right: 20 },
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
  }
  
  // Vendas por Dia
  if (dados.vendasPorDia.length > 0) {
    // Nova página se necessário
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Vendas por Dia', 20, yPosition);
    yPosition += 10;
    
    const vendasBody = dados.vendasPorDia.map(v => [
      new Date(v.data).toLocaleDateString('pt-BR'),
      v.quantidade.toString(),
      formatarMoeda(v.valor)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Data', 'Pedidos', 'Valor Total']],
      body: vendasBody,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] },
      margin: { left: 20, right: 20 },
    });
  }
  
  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Salvar PDF
  const nomeArquivo = `relatorio-vendas-${new Date().getTime()}.pdf`;
  doc.save(nomeArquivo);
}