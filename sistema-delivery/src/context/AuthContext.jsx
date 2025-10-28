import { createContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observar mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função de login
  async function signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login realizado com sucesso!');
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      // Mensagens de erro personalizadas
      if (error.code === 'auth/invalid-credential') {
        toast.error('Email ou senha inválidos!');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('Usuário não encontrado!');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Senha incorreta!');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
      
      throw error;
    }
  }

  // Função de logout
  async function logout() {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout.');
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      logout,
      signed: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

