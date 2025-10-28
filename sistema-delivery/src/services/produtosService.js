import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const produtosCollection = collection(db, 'produtos');

// Upload de imagem
export async function uploadImagemProduto(file) {
  try {
    // Criar nome único para o arquivo
    const timestamp = Date.now();
    const nomeArquivo = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `produtos/${nomeArquivo}`);

    // Upload do arquivo
    await uploadBytes(storageRef, file);

    // Obter URL de download
    const downloadURL = await getDownloadURL(storageRef);

    return {
      url: downloadURL,
      path: `produtos/${nomeArquivo}`
    };
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}

// Deletar imagem
export async function deletarImagemProduto(imagePath) {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    // Não lançar erro se a imagem não existir
  }
}

// Criar novo produto
export async function criarProduto(produtoData) {
  try {
    const docRef = await addDoc(produtosCollection, {
      ...produtoData,
      ativo: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
}

// Buscar todos os produtos
export async function buscarProdutos() {
  try {
    const q = query(produtosCollection, orderBy('nome', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const produtos = [];
    querySnapshot.forEach((doc) => {
      produtos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return produtos;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

// Buscar produtos por categoria
export async function buscarProdutosPorCategoria(categoriaId) {
  try {
    const q = query(
      produtosCollection, 
      where('categoriaId', '==', categoriaId),
      orderBy('nome', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const produtos = [];
    querySnapshot.forEach((doc) => {
      produtos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return produtos;
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    throw error;
  }
}

// Atualizar produto
export async function atualizarProduto(produtoId, produtoData) {
  try {
    const produtoRef = doc(db, 'produtos', produtoId);
    await updateDoc(produtoRef, {
      ...produtoData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
}

// Deletar produto
export async function deletarProduto(produtoId, imagemPath) {
  try {
    // Deletar imagem se existir
    if (imagemPath) {
      await deletarImagemProduto(imagemPath);
    }

    // Deletar documento
    await deleteDoc(doc(db, 'produtos', produtoId));
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
}

// Alternar status ativo/inativo
export async function toggleProdutoAtivo(produtoId, ativo) {
  try {
    const produtoRef = doc(db, 'produtos', produtoId);
    await updateDoc(produtoRef, {
      ativo,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);
    throw error;
  }
}