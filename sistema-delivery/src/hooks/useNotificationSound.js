import { useRef, useCallback } from 'react';

export function useNotificationSound() {
  const audioRef = useRef(null);

  const playNotification = useCallback(() => {
    try {
      // Se o audioRef ainda não foi criado, cria uma nova instância
      if (!audioRef.current) {
        audioRef.current = new Audio('/src/assets/sounds/notification.mp3');
        audioRef.current.volume = 1.0; // Volume 50%
      }

      // Para o som se já estiver tocando e reinicia
      audioRef.current.currentTime = 0;
      
      // Toca o som
      audioRef.current.play().catch(error => {
        console.error('Erro ao tocar notificação:', error);
      });

      console.log('🔔 Notificação sonora tocada!');
    } catch (error) {
      console.error('Erro ao tocar notificação:', error);
    }
  }, []);

  return { playNotification };
}