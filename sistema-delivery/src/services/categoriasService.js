import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const categoriasCollection = collection(db, 'categorias');

// Criar nova categoria
export async function criarCategoria(categoriaData) {
  try {
    const docRef = await addDoc(categoriasCollection, {
      ...categoriaData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
}

// Buscar todas as categorias
export async function buscarCategorias() {
  try {
    const q = query(categoriasCollection, orderBy('nome', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const categorias = [];
    querySnapshot.forEach((doc) => {
      categorias.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return categorias;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
}

// Atualizar categoria
export async function atualizarCategoria(categoriaId, categoriaData) {
  try {
    const categoriaRef = doc(db, 'categorias', categoriaId);
    await updateDoc(categoriaRef, {
      ...categoriaData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
}

// Deletar categoria
export async function deletarCategoria(categoriaId) {
  try {
    await deleteDoc(doc(db, 'categorias', categoriaId));
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
}