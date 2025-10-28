import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

const pedidosCollection = collection(db, 'pedidos');

// Criar um novo pedido
export async function criarPedido(pedidoData) {
  try {
    const docRef = await addDoc(pedidosCollection, {
      ...pedidoData,
      status: 'pendente',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

// Buscar todos os pedidos
export async function buscarPedidos() {
  try {
    const q = query(pedidosCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return pedidos;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
}

// Observar pedidos em tempo real
export function observarPedidos(callback) {
  const q = query(pedidosCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(pedidos);
  }, (error) => {
    console.error('Erro ao observar pedidos:', error);
  });

  return unsubscribe;
}

// Atualizar status do pedido
export async function atualizarStatusPedido(pedidoId, novoStatus) {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    await updateDoc(pedidoRef, {
      status: novoStatus,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

// Aceitar pedido
export async function aceitarPedido(pedidoId) {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    await updateDoc(pedidoRef, {
      status: 'aceito',
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erro ao aceitar pedido:', error);
    throw error;
  }
}

// Recusar pedido
export async function recusarPedido(pedidoId, motivo = '') {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    await updateDoc(pedidoRef, {
      status: 'recusado',
      motivoRecusa: motivo,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Erro ao recusar pedido:', error);
    throw error;
  }
}

// Deletar pedido
export async function deletarPedido(pedidoId) {
  try {
    await deleteDoc(doc(db, 'pedidos', pedidoId));
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    throw error;
  }
}