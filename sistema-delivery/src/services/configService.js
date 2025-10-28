import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const CONFIG_DOC_ID = 'estabelecimento';
const configDocRef = doc(db, 'configuracoes', CONFIG_DOC_ID);

// Buscar configurações
export async function buscarConfiguracoes() {
  try {
    const docSnap = await getDoc(configDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Retornar configurações padrão se não existir
      const configPadrao = {
        nomeEstabelecimento: 'Meu Estabelecimento',
        endereco: 'Rua Exemplo, 123 - Centro',
        telefone: '(11) 99999-9999',
        horarioFuncionamento: {
          segunda: { aberto: true, inicio: '08:00', fim: '22:00' },
          terca: { aberto: true, inicio: '08:00', fim: '22:00' },
          quarta: { aberto: true, inicio: '08:00', fim: '22:00' },
          quinta: { aberto: true, inicio: '08:00', fim: '22:00' },
          sexta: { aberto: true, inicio: '08:00', fim: '22:00' },
          sabado: { aberto: true, inicio: '09:00', fim: '23:00' },
          domingo: { aberto: false, inicio: '09:00', fim: '18:00' }
        },
        valorFrete: 5.00,
        freteGratis: 50.00,
        raioEntrega: 5,
        tempoEntregaMin: 30,
        tempoEntregaMax: 60,
        aceitaPedidos: true,
        logoUrl: '',
        logoPath: '',
        corPrimaria: '#e74c3c',
        corSecundaria: '#2c3e50',
        instagram: '',
        facebook: ''
      };
      
      // Criar documento com configurações padrão
      await setDoc(configDocRef, configPadrao);
      return configPadrao;
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    throw error;
  }
}

// Atualizar configurações
export async function atualizarConfiguracoes(configuracoes) {
  try {
    await updateDoc(configDocRef, configuracoes);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    throw error;
  }
}

// Upload de logo
export async function uploadLogo(file) {
  try {
    const timestamp = Date.now();
    const nomeArquivo = `logo_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `logos/${nomeArquivo}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      url: downloadURL,
      path: `logos/${nomeArquivo}`
    };
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    throw error;
  }
}

// Deletar logo
export async function deletarLogo(logoPath) {
  try {
    if (!logoPath) return;
    const logoRef = ref(storage, logoPath);
    await deleteObject(logoRef);
  } catch (error) {
    console.error('Erro ao deletar logo:', error);
  }
}

// Alternar aceitação de pedidos
export async function toggleAceitarPedidos(aceitar) {
  try {
    await updateDoc(configDocRef, {
      aceitaPedidos: aceitar
    });
  } catch (error) {
    console.error('Erro ao alterar aceitação de pedidos:', error);
    throw error;
  }
}