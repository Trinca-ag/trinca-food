import { useState, useEffect } from 'react';
import { 
  buscarConfiguracoes, 
  atualizarConfiguracoes, 
  uploadLogo,
  toggleAceitarPedidos 
} from '../../services/configService';
import { formatarMoeda } from '../../utils/formatters';
import toast from 'react-hot-toast';
import './Configuracoes.css';

export function Configuracoes() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('geral');

  // Dados do estabelecimento
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');

  // Horário de funcionamento
  const [horarioFuncionamento, setHorarioFuncionamento] = useState({
    segunda: { aberto: true, inicio: '08:00', fim: '22:00' },
    terca: { aberto: true, inicio: '08:00', fim: '22:00' },
    quarta: { aberto: true, inicio: '08:00', fim: '22:00' },
    quinta: { aberto: true, inicio: '08:00', fim: '22:00' },
    sexta: { aberto: true, inicio: '08:00', fim: '22:00' },
    sabado: { aberto: true, inicio: '09:00', fim: '23:00' },
    domingo: { aberto: false, inicio: '09:00', fim: '18:00' }
  });

  // Entrega
  const [valorFrete, setValorFrete] = useState('5.00');
  const [freteGratis, setFreteGratis] = useState('50.00');
  const [raioEntrega, setRaioEntrega] = useState('5');
  const [tempoEntregaMin, setTempoEntregaMin] = useState('30');
  const [tempoEntregaMax, setTempoEntregaMax] = useState('60');
  const [aceitaPedidos, setAceitaPedidos] = useState(true);

  // Personalização
  const [corPrimaria, setCorPrimaria] = useState('#e74c3c');
  const [corSecundaria, setCorSecundaria] = useState('#2c3e50');

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const config = await buscarConfiguracoes();

      setNomeEstabelecimento(config.nomeEstabelecimento || '');
      setEndereco(config.endereco || '');
      setTelefone(config.telefone || '');
      setInstagram(config.instagram || '');
      setFacebook(config.facebook || '');
      setLogoUrl(config.logoUrl || '');
      setLogoPath(config.logoPath || '');
      setPreviewLogo(config.logoUrl || '');

      if (config.horarioFuncionamento) {
        setHorarioFuncionamento(config.horarioFuncionamento);
      }

      setValorFrete(config.valorFrete?.toString() || '5.00');
      setFreteGratis(config.freteGratis?.toString() || '50.00');
      setRaioEntrega(config.raioEntrega?.toString() || '5');
      setTempoEntregaMin(config.tempoEntregaMin?.toString() || '30');
      setTempoEntregaMax(config.tempoEntregaMax?.toString() || '60');
      setAceitaPedidos(config.aceitaPedidos !== false);

      setCorPrimaria(config.corPrimaria || '#e74c3c');
      setCorSecundaria(config.corSecundaria || '#2c3e50');
    } catch (error) {
      toast.error('Erro ao carregar configurações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB');
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleHorarioChange(dia, campo, valor) {
    setHorarioFuncionamento(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  }

  async function handleSalvar(e) {
    e.preventDefault();

    if (!nomeEstabelecimento.trim()) {
      toast.error('Preencha o nome do estabelecimento');
      return;
    }

    try {
      setSalvando(true);

      let urlLogo = logoUrl;
      let pathLogo = logoPath;

      // Upload de novo logo se selecionado
      if (logoFile) {
        setUploadingLogo(true);
        const uploadResult = await uploadLogo(logoFile);
        urlLogo = uploadResult.url;
        pathLogo = uploadResult.path;
        setUploadingLogo(false);
      }

      const configuracoes = {
        nomeEstabelecimento: nomeEstabelecimento.trim(),
        endereco: endereco.trim(),
        telefone: telefone.trim(),
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        logoUrl: urlLogo,
        logoPath: pathLogo,
        horarioFuncionamento,
        valorFrete: parseFloat(valorFrete) || 0,
        freteGratis: parseFloat(freteGratis) || 0,
        raioEntrega: parseInt(raioEntrega) || 0,
        tempoEntregaMin: parseInt(tempoEntregaMin) || 0,
        tempoEntregaMax: parseInt(tempoEntregaMax) || 0,
        aceitaPedidos,
        corPrimaria,
        corSecundaria
      };

      await atualizarConfiguracoes(configuracoes);
      toast.success('Configurações salvas com sucesso!');
      
      setLogoUrl(urlLogo);
      setLogoPath(pathLogo);
      setLogoFile(null);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setSalvando(false);
    }
  }

  async function handleTogglePedidos() {
    try {
      const novoValor = !aceitaPedidos;
      await toggleAceitarPedidos(novoValor);
      setAceitaPedidos(novoValor);
      toast.success(novoValor ? 'Pedidos ativados!' : 'Pedidos pausados!');
    } catch (error) {
      toast.error('Erro ao alterar status');
      console.error(error);
    }
  }

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="configuracoes-page">
      <div className="page-header">
        <h1>⚙️ Configurações do Estabelecimento</h1>
        <button 
          className={`btn-toggle-pedidos ${aceitaPedidos ? 'ativo' : 'inativo'}`}
          onClick={handleTogglePedidos}
        >
          {aceitaPedidos ? '✓ Aceitando Pedidos' : '✗ Pedidos Pausados'}
        </button>
      </div>

      {/* Abas */}
      <div className="abas-container">
        <button 
          className={abaAtiva === 'geral' ? 'aba-btn active' : 'aba-btn'}
          onClick={() => setAbaAtiva('geral')}
        >
          📋 Dados Gerais
        </button>
        <button 
          className={abaAtiva === 'horario' ? 'aba-btn active' : 'aba-btn'}
          onClick={() => setAbaAtiva('horario')}
        >
          🕐 Horário de Funcionamento
        </button>
        <button 
          className={abaAtiva === 'entrega' ? 'aba-btn active' : 'aba-btn'}
          onClick={() => setAbaAtiva('entrega')}
        >
          🚚 Entrega
        </button>
        <button 
          className={abaAtiva === 'personalizacao' ? 'aba-btn active' : 'aba-btn'}
          onClick={() => setAbaAtiva('personalizacao')}
        >
          🎨 Personalização
        </button>
      </div>

      <form onSubmit={handleSalvar} className="config-form">
        
        {/* Aba: Dados Gerais */}
        {abaAtiva === 'geral' && (
          <div className="config-section">
            <h2>Informações do Estabelecimento</h2>

            {/* Logo */}
            <div className="form-group">
              <label>Logo do Estabelecimento</label>
              <div className="logo-upload-area">
                {previewLogo ? (
                  <div className="logo-preview">
                    <img src={previewLogo} alt="Logo" />
                    <button
                      type="button"
                      className="btn-remover-logo"
                      onClick={() => {
                        setPreviewLogo('');
                        setLogoFile(null);
                        setLogoUrl('');
                        setLogoPath('');
                      }}
                    >
                      ✕ Remover
                    </button>
                  </div>
                ) : (
                  <label className="logo-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={{ display: 'none' }}
                    />
                    <div className="logo-upload-placeholder">
                      <span className="upload-icon">🖼️</span>
                      <p>Clique para adicionar logo</p>
                      <span className="upload-hint">PNG, JPG (máx. 2MB)</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome do Estabelecimento *</label>
              <input
                type="text"
                id="nome"
                value={nomeEstabelecimento}
                onChange={(e) => setNomeEstabelecimento(e.target.value)}
                placeholder="Ex: Pizzaria Bella"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endereco">Endereço Completo</label>
              <input
                type="text"
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número - Bairro - Cidade/UF"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 3333-4444"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <input
                  type="text"
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@meurestaurante"
                />
              </div>

              <div className="form-group">
                <label htmlFor="facebook">Facebook</label>
                <input
                  type="text"
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/meurestaurante"
                />
              </div>
            </div>
          </div>
        )}

        {/* Aba: Horário de Funcionamento */}
        {abaAtiva === 'horario' && (
          <div className="config-section">
            <h2>Horário de Funcionamento</h2>
            
            <div className="horarios-grid">
              {diasSemana.map(dia => (
                <div key={dia.key} className="horario-card">
                  <div className="horario-header">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={horarioFuncionamento[dia.key]?.aberto}
                        onChange={(e) => handleHorarioChange(dia.key, 'aberto', e.target.checked)}
                      />
                      <strong>{dia.label}</strong>
                    </label>
                  </div>

                  {horarioFuncionamento[dia.key]?.aberto && (
                    <div className="horario-inputs">
                      <input
                        type="time"
                        value={horarioFuncionamento[dia.key]?.inicio || '08:00'}
                        onChange={(e) => handleHorarioChange(dia.key, 'inicio', e.target.value)}
                      />
                      <span>às</span>
                      <input
                        type="time"
                        value={horarioFuncionamento[dia.key]?.fim || '22:00'}
                        onChange={(e) => handleHorarioChange(dia.key, 'fim', e.target.value)}
                      />
                    </div>
                  )}

                  {!horarioFuncionamento[dia.key]?.aberto && (
                    <div className="horario-fechado">
                      Fechado
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba: Entrega */}
        {abaAtiva === 'entrega' && (
          <div className="config-section">
            <h2>Configurações de Entrega</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="valorFrete">Valor do Frete (R$)</label>
                <input
                  type="number"
                  id="valorFrete"
                  value={valorFrete}
                  onChange={(e) => setValorFrete(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="freteGratis">Frete Grátis Acima de (R$)</label>
                <input
                  type="number"
                  id="freteGratis"
                  value={freteGratis}
                  onChange={(e) => setFreteGratis(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="raioEntrega">Raio de Entrega (km)</label>
                <input
                  type="number"
                  id="raioEntrega"
                  value={raioEntrega}
                  onChange={(e) => setRaioEntrega(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tempoEntregaMin">Tempo Mínimo (min)</label>
                <input
                  type="number"
                  id="tempoEntregaMin"
                  value={tempoEntregaMin}
                  onChange={(e) => setTempoEntregaMin(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tempoEntregaMax">Tempo Máximo (min)</label>
                <input
                  type="number"
                  id="tempoEntregaMax"
                  value={tempoEntregaMax}
                  onChange={(e) => setTempoEntregaMax(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="info-box">
              <p><strong>💡 Informações de Entrega:</strong></p>
              <ul>
                <li>Valor do frete: {formatarMoeda(parseFloat(valorFrete) || 0)}</li>
                <li>Frete grátis para pedidos acima de: {formatarMoeda(parseFloat(freteGratis) || 0)}</li>
                <li>Tempo estimado: {tempoEntregaMin}-{tempoEntregaMax} minutos</li>
              </ul>
            </div>
          </div>
        )}

        {/* Aba: Personalização */}
        {abaAtiva === 'personalizacao' && (
          <div className="config-section">
            <h2>Personalização Visual</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="corPrimaria">Cor Primária</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="corPrimaria"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                  />
                  <input
                    type="text"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    placeholder="#e74c3c"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="corSecundaria">Cor Secundária</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="corSecundaria"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                  />
                  <input
                    type="text"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    placeholder="#2c3e50"
                  />
                </div>
              </div>
            </div>

            <div className="info-box">
              <p><strong>🎨 Preview das Cores:</strong></p>
              <div className="color-preview">
                <div 
                  className="color-sample" 
                  style={{ backgroundColor: corPrimaria }}
                >
                  <span>Cor Primária</span>
                </div>
                <div 
                  className="color-sample" 
                  style={{ backgroundColor: corSecundaria }}
                >
                  <span>Cor Secundária</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={salvando || uploadingLogo}
          >
            {uploadingLogo ? 'Enviando logo...' : salvando ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}