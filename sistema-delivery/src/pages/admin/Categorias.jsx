import { useState, useEffect } from 'react';
import { 
  buscarCategorias, 
  criarCategoria, 
  atualizarCategoria, 
  deletarCategoria 
} from '../../services/categoriasService';
import toast from 'react-hot-toast';
import './Categorias.css';

export function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  
  // Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [icone, setIcone] = useState('🍔');

  const iconesDisponiveis = [
    '🍕', '🍔', '🌭', '🥤', '🍟', '🍗', '🥗', '🍰', 
    '🍦', '☕', '🍺', '🍷', '🥘', '🍜', '🍱', '🌮'
  ];

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    try {
      setLoading(true);
      const dados = await buscarCategorias();
      setCategorias(dados);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(categoria = null) {
    if (categoria) {
      setCategoriaEditando(categoria);
      setNome(categoria.nome);
      setDescricao(categoria.descricao || '');
      setIcone(categoria.icone || '🍔');
    } else {
      setCategoriaEditando(null);
      setNome('');
      setDescricao('');
      setIcone('🍔');
    }
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCategoriaEditando(null);
    setNome('');
    setDescricao('');
    setIcone('🍔');
  }

  async function handleSalvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Preencha o nome da categoria');
      return;
    }

    try {
      const categoriaData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        icone
      };

      if (categoriaEditando) {
        await atualizarCategoria(categoriaEditando.id, categoriaData);
        toast.success('Categoria atualizada!');
      } else {
        await criarCategoria(categoriaData);
        toast.success('Categoria criada!');
      }

      fecharModal();
      carregarCategorias();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
      console.error(error);
    }
  }

  async function handleDeletar(categoria) {
    if (window.confirm(`Tem certeza que deseja deletar a categoria "${categoria.nome}"?`)) {
      try {
        await deletarCategoria(categoria.id);
        toast.success('Categoria deletada!');
        carregarCategorias();
      } catch (error) {
        toast.error('Erro ao deletar categoria');
        console.error(error);
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="categorias-page">
      <div className="page-header">
        <h1>📂 Gerenciar Categorias</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Nova Categoria
        </button>
      </div>

      {categorias.length === 0 ? (
        <div className="empty-state">
          <h3>📭 Nenhuma categoria cadastrada</h3>
          <p>Comece criando sua primeira categoria de produtos</p>
          <button className="btn btn-primary" onClick={() => abrirModal()}>
            + Criar Primeira Categoria
          </button>
        </div>
      ) : (
        <div className="categorias-grid">
          {categorias.map(categoria => (
            <div key={categoria.id} className="categoria-card">
              <div className="categoria-icone">{categoria.icone}</div>
              <div className="categoria-info">
                <h3>{categoria.nome}</h3>
                {categoria.descricao && <p>{categoria.descricao}</p>}
              </div>
              <div className="categoria-acoes">
                <button 
                  className="btn-editar"
                  onClick={() => abrirModal(categoria)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  className="btn-deletar"
                  onClick={() => handleDeletar(categoria)}
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar" onClick={fecharModal}>✕</button>
            
            <h2>{categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}</h2>

            <form onSubmit={handleSalvar} className="categoria-form">
              <div className="form-group">
                <label>Ícone</label>
                <div className="icones-grid">
                  {iconesDisponiveis.map(iconeOpcao => (
                    <button
                      key={iconeOpcao}
                      type="button"
                      className={`icone-btn ${icone === iconeOpcao ? 'active' : ''}`}
                      onClick={() => setIcone(iconeOpcao)}
                    >
                      {iconeOpcao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome *</label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Lanches, Bebidas, Pizzas..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição opcional da categoria"
                  rows="3"
                />
              </div>

              <div className="form-acoes">
                <button type="button" className="btn btn-secondary" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {categoriaEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}