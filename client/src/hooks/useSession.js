import { useState } from 'react';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useSession = () => {
  const [sessionId] = useState(() => {
    try {
      let id = localStorage.getItem('sessionId');
      if (!id) {
        id = window.crypto?.randomUUID ? window.crypto.randomUUID() : generateUUID();
        localStorage.setItem('sessionId', id);
      }
      return id;
    } catch (error) {
      return window.crypto?.randomUUID ? window.crypto.randomUUID() : generateUUID();
    }
  });
  return sessionId;
};