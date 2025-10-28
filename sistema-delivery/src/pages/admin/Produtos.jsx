import { useState, useEffect } from 'react';
import { 
  buscarProdutos, 
  criarProduto, 
  atualizarProduto, 
  deletarProduto,
  uploadImagemProduto,
  toggleProdutoAtivo
} from '../../services/produtosService';
import { buscarCategorias } from '../../services/categoriasService';
import { formatarMoeda } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Produtos.css';

export function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [uploadingImagem, setUploadingImagem] = useState(false);
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [imagemPath, setImagemPath] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [previewImagem, setPreviewImagem] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [produtosData, categoriasData] = await Promise.all([
        buscarProdutos(),
        buscarCategorias()
      ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(produto = null) {
    if (produto) {
      setProdutoEditando(produto);
      setNome(produto.nome);
      setDescricao(produto.descricao || '');
      setPreco(produto.preco.toString());
      setCategoriaId(produto.categoriaId);
      setImagemUrl(produto.imagemUrl || '');
      setImagemPath(produto.imagemPath || '');
      setPreviewImagem(produto.imagemUrl || '');
    } else {
      setProdutoEditando(null);
      setNome('');
      setDescricao('');
      setPreco('');
      setCategoriaId('');
      setImagemUrl('');
      setImagemPath('');
      setPreviewImagem('');
    }
    setImagemFile(null);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setProdutoEditando(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setCategoriaId('');
    setImagemUrl('');
    setImagemPath('');
    setImagemFile(null);
    setPreviewImagem('');
  }

  function handleImagemChange(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      setImagemFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagem(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();

    if (!nome.trim() || !preco || !categoriaId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const precoNumerico = parseFloat(preco);
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      toast.error('Preço inválido');
      return;
    }

    try {
      let urlImagem = imagemUrl;
      let pathImagem = imagemPath;

      // Upload de nova imagem se selecionada
      if (imagemFile) {
        setUploadingImagem(true);
        const uploadResult = await uploadImagemProduto(imagemFile);
        urlImagem = uploadResult.url;
        pathImagem = uploadResult.path;
        setUploadingImagem(false);
      }

      const produtoData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        categoriaId,
        imagemUrl: urlImagem,
        imagemPath: pathImagem
      };

      if (produtoEditando) {
        await atualizarProduto(produtoEditando.id, produtoData);
        toast.success('Produto atualizado!');
      } else {
        await criarProduto(produtoData);
        toast.success('Produto criado!');
      }

      fecharModal();
      carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar produto');
      console.error(error);
      setUploadingImagem(false);
    }
  }

  async function handleDeletar(produto) {
    if (window.confirm(`Tem certeza que deseja deletar "${produto.nome}"?`)) {
      try {
        await deletarProduto(produto.id, produto.imagemPath);
        toast.success('Produto deletado!');
        carregarDados();
      } catch (error) {
        toast.error('Erro ao deletar produto');
        console.error(error);
      }
    }
  }

  async function handleToggleAtivo(produto) {
    try {
      await toggleProdutoAtivo(produto.id, !produto.ativo);
      toast.success(produto.ativo ? 'Produto desativado!' : 'Produto ativado!');
      carregarDados();
    } catch (error) {
      toast.error('Erro ao alterar status');
      console.error(error);
    }
  }

  // Filtrar produtos
  const produtosFiltrados = produtos.filter(produto => {
    const categoriaMatch = filtroCategoria === 'todas' || produto.categoriaId === filtroCategoria;
    const statusMatch = filtroStatus === 'todos' || 
                       (filtroStatus === 'ativos' && produto.ativo) ||
                       (filtroStatus === 'inativos' && !produto.ativo);
    return categoriaMatch && statusMatch;
  });

  function obterNomeCategoria(categoriaId) {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nome : 'Sem categoria';
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="produtos-page">
      <div className="page-header">
        <h1>🍔 Gerenciar Produtos</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-grupo">
          <label>Categoria:</label>
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icone} {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Status:</label>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="empty-state">
          <h3>📭 Nenhum produto encontrado</h3>
          <p>Comece criando seu primeiro produto</p>
          <button className="btn btn-primary" onClick={() => abrirModal()}>
            + Criar Primeiro Produto
          </button>
        </div>
      ) : (
        <div className="produtos-grid">
          {produtosFiltrados.map(produto => (
            <div key={produto.id} className={`produto-card ${!produto.ativo ? 'inativo' : ''}`}>
              <div className="produto-imagem">
                {produto.imagemUrl ? (
                  <img src={produto.imagemUrl} alt={produto.nome} />
                ) : (
                  <div className="sem-imagem">🖼️</div>
                )}
                {!produto.ativo && (
                  <div className="badge-inativo">Inativo</div>
                )}
              </div>

              <div className="produto-info">
                <h3>{produto.nome}</h3>
                <p className="produto-categoria">
                  {obterNomeCategoria(produto.categoriaId)}
                </p>
                {produto.descricao && (
                  <p className="produto-descricao">{produto.descricao}</p>
                )}
                <p className="produto-preco">{formatarMoeda(produto.preco)}</p>
              </div>

              <div className="produto-acoes">
                <button 
                  className={`btn-toggle ${produto.ativo ? 'ativo' : 'inativo'}`}
                  onClick={() => handleToggleAtivo(produto)}
                  title={produto.ativo ? 'Desativar' : 'Ativar'}
                >
                  {produto.ativo ? '✓' : '✗'}
                </button>
                <button 
                  className="btn-editar"
                  onClick={() => abrirModal(produto)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  className="btn-deletar"
                  onClick={() => handleDeletar(produto)}
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
          <div className="modal-content modal-produto" onClick={(e) => e.stopPropagation()}>
            <button className="btn-fechar" onClick={fecharModal}>✕</button>
            
            <h2>{produtoEditando ? 'Editar Produto' : 'Novo Produto'}</h2>

            <form onSubmit={handleSalvar} className="produto-form">
              {/* Upload de Imagem */}
              <div className="form-group">
                <label>Imagem do Produto</label>
                <div className="upload-area">
                  {previewImagem ? (
                    <div className="preview-container">
                      <img src={previewImagem} alt="Preview" className="preview-imagem" />
                      <button
                        type="button"
                        className="btn-remover-imagem"
                        onClick={() => {
                          setPreviewImagem('');
                          setImagemFile(null);
                          setImagemUrl('');
                          setImagemPath('');
                        }}
                      >
                        ✕ Remover
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagemChange}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <p>Clique para selecionar uma imagem</p>
                        <span className="upload-hint">PNG, JPG ou WEBP (máx. 5MB)</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome *</label>
                <input
                  type="text"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: X-Burger Especial"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria *</label>
                <select
                  id="categoria"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icone} {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preco">Preço *</label>
                <input
                  type="number"
                  id="preco"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o produto..."
                  rows="4"
                />
              </div>

              <div className="form-acoes">
                <button type="button" className="btn btn-secondary" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadingImagem}>
                  {uploadingImagem ? 'Enviando imagem...' : produtoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}