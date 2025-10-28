import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { 
  observarPedidos, 
  atualizarStatusPedido, 
  aceitarPedido, 
  recusarPedido 
} from '../../services/pedidosService';
import { formatarMoeda, formatarDataHora, obterStatusTexto, obterCorStatus } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Pedidos.css';

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [ultimosPedidosIds, setUltimosPedidosIds] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { playNotification } = useNotificationSound();

  useEffect(() => {
    // Observar pedidos em tempo real
    const unsubscribe = observarPedidos((pedidosAtualizados) => {
      // Verificar se há novos pedidos pendentes
      const novosPedidosPendentes = pedidosAtualizados.filter(
        p => p.status === 'pendente' && !ultimosPedidosIds.includes(p.id)
      );

      // Se houver novos pedidos, tocar notificação
      if (novosPedidosPendentes.length > 0 && ultimosPedidosIds.length > 0) {
        playNotification();
        toast.success(`🔔 Novo pedido recebido!`, {
          duration: 5000,
          icon: '🍕',
        });
      }

      // Atualizar lista de IDs
      setUltimosPedidosIds(pedidosAtualizados.map(p => p.id));

      setPedidos(pedidosAtualizados);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ultimosPedidosIds, playNotification]);

  // Filtrar pedidos por status
  useEffect(() => {
    if (filtroStatus === 'todos') {
      setPedidosFiltrados(pedidos);
    } else {
      setPedidosFiltrados(pedidos.filter(p => p.status === filtroStatus));
    }
  }, [pedidos, filtroStatus]);

  async function handleLogout() {
    await logout();
    navigate('/admin');
  }

  async function handleAceitarPedido(pedidoId) {
    try {
      await aceitarPedido(pedidoId);
      await atualizarStatusPedido(pedidoId, 'em_preparo');
      toast.success('Pedido aceito e em preparo!');
      setPedidoSelecionado(null);
    } catch (error) {
      toast.error('Erro ao aceitar pedido');
      console.error(error);
    }
  }

  async function handleRecusarPedido(pedidoId) {
    const motivo = prompt('Motivo da recusa (opcional):');
    try {
      await recusarPedido(pedidoId, motivo || '');
      toast.success('Pedido recusado');
      setPedidoSelecionado(null);
    } catch (error) {
      toast.error('Erro ao recusar pedido');
      console.error(error);
    }
  }

  async function handleAtualizarStatus(pedidoId, novoStatus) {
    try {
      await atualizarStatusPedido(pedidoId, novoStatus);
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    }
  }

  function abrirDetalhes(pedido) {
    setPedidoSelecionado(pedido);
  }

  function fecharDetalhes() {
    setPedidoSelecionado(null);
  }

  // Contadores
  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length;
  const pedidosEmAndamento = pedidos.filter(p => 
    ['aceito', 'em_preparo', 'saiu_para_entrega', 'pronto_para_retirada'].includes(p.status)
  ).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

return (
  <div className="pedidos-page">
    {/* Cards de Resumo */}
    <div className="resumo-cards">
      <div className="resumo-card pendentes">
        <div className="card-icon">🔔</div>
        <div className="card-info">
          <h3>{pedidosPendentes}</h3>
          <p>Pendentes</p>
        </div>
      </div>

      <div className="resumo-card andamento">
        <div className="card-icon">⏳</div>
        <div className="card-info">
          <h3>{pedidosEmAndamento}</h3>
          <p>Em Andamento</p>
        </div>
      </div>

      <div className="resumo-card total">
        <div className="card-icon">📊</div>
        <div className="card-info">
          <h3>{pedidos.length}</h3>
          <p>Total Hoje</p>
        </div>
      </div>
    </div>

    {/* Filtros */}
    <div className="filtros-container">
      <button 
        className={filtroStatus === 'todos' ? 'filtro-btn active' : 'filtro-btn'}
        onClick={() => setFiltroStatus('todos')}
      >
        Todos ({pedidos.length})
      </button>
      <button 
        className={filtroStatus === 'pendente' ? 'filtro-btn active' : 'filtro-btn'}
        onClick={() => setFiltroStatus('pendente')}
      >
        Pendentes ({pedidosPendentes})
      </button>
      <button 
        className={filtroStatus === 'em_preparo' ? 'filtro-btn active' : 'filtro-btn'}
        onClick={() => setFiltroStatus('em_preparo')}
      >
        Em Preparo
      </button>
      <button 
        className={filtroStatus === 'saiu_para_entrega' ? 'filtro-btn active' : 'filtro-btn'}
        onClick={() => setFiltroStatus('saiu_para_entrega')}
      >
        Em Entrega
      </button>
      <button 
        className={filtroStatus === 'concluido' ? 'filtro-btn active' : 'filtro-btn'}
        onClick={() => setFiltroStatus('concluido')}
      >
        Concluídos
      </button>
    </div>

    {/* Lista de Pedidos */}
    <div className="pedidos-lista">
      {pedidosFiltrados.length === 0 ? (
        <div className="sem-pedidos">
          <h3>📭 Nenhum pedido encontrado</h3>
          <p>Os pedidos aparecerão aqui em tempo real</p>
        </div>
      ) : (
        pedidosFiltrados.map(pedido => (
          <div 
            key={pedido.id} 
            className={`pedido-card ${pedido.status}`}
            onClick={() => abrirDetalhes(pedido)}
          >
            <div className="pedido-header-card">
              <div>
                <h3>{pedido.clienteNome}</h3>
                <p className="pedido-hora">{formatarDataHora(pedido.createdAt)}</p>
              </div>
              <div 
                className="status-badge"
                style={{ backgroundColor: obterCorStatus(pedido.status) }}
              >
                {obterStatusTexto(pedido.status)}
              </div>
            </div>

            <div className="pedido-info">
              <p><strong>📍</strong> {pedido.endereco || 'Retirada no local'}</p>
              <p><strong>📞</strong> {pedido.clienteTelefone}</p>
              <p><strong>💰</strong> {formatarMoeda(pedido.valorTotal)}</p>
              <p><strong>🚚</strong> {pedido.tipoRetirada === 'entrega' ? 'Entrega' : 'Retirada no Local'}</p>
            </div>

            {pedido.status === 'pendente' && (
              <div className="pedido-acoes">
                <button 
                  className="btn-aceitar"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAceitarPedido(pedido.id);
                  }}
                >
                  ✓ Aceitar
                </button>
                <button 
                  className="btn-recusar"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecusarPedido(pedido.id);
                  }}
                >
                  ✗ Recusar
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>

    {/* Modal de Detalhes - permanece igual */}
    {pedidoSelecionado && (
      <div className="modal-overlay" onClick={fecharDetalhes}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="btn-fechar" onClick={fecharDetalhes}>✕</button>
          
          <h2>Detalhes do Pedido</h2>

          <div className="modal-section">
            <h3>👤 Cliente</h3>
            <p><strong>Nome:</strong> {pedidoSelecionado.clienteNome}</p>
            <p><strong>Telefone:</strong> {pedidoSelecionado.clienteTelefone}</p>
            <p><strong>Endereço:</strong> {pedidoSelecionado.endereco || 'Retirada no local'}</p>
          </div>

          <div className="modal-section">
            <h3>🛒 Itens do Pedido</h3>
            {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
              <ul className="itens-lista">
                {pedidoSelecionado.itens.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Nenhum item especificado</p>
            )}
          </div>

          <div className="modal-section">
            <h3>💳 Pagamento</h3>
            <p><strong>Forma:</strong> {pedidoSelecionado.formaPagamento}</p>
            <p><strong>Total:</strong> {formatarMoeda(pedidoSelecionado.valorTotal)}</p>
          </div>

          <div className="modal-section">
            <h3>📊 Status</h3>
            <select 
              value={pedidoSelecionado.status}
              onChange={(e) => handleAtualizarStatus(pedidoSelecionado.id, e.target.value)}
              className="status-select"
              disabled={pedidoSelecionado.status === 'concluido' || pedidoSelecionado.status === 'recusado'}
            >
              <option value="pendente">Pendente</option>
              <option value="aceito">Aceito</option>
              <option value="em_preparo">Em Preparo</option>
              {pedidoSelecionado.tipoRetirada === 'entrega' ? (
                <option value="saiu_para_entrega">Saiu para Entrega</option>
              ) : (
                <option value="pronto_para_retirada">Pronto para Retirada</option>
              )}
              <option value="concluido">Concluído</option>
              <option value="recusado">Recusado</option>
            </select>
          </div>

          {pedidoSelecionado.status === 'pendente' && (
            <div className="modal-acoes">
              <button 
                className="btn-aceitar"
                onClick={() => handleAceitarPedido(pedidoSelecionado.id)}
              >
                ✓ Aceitar Pedido
              </button>
              <button 
                className="btn-recusar"
                onClick={() => handleRecusarPedido(pedidoSelecionado.id)}
              >
                ✗ Recusar Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}