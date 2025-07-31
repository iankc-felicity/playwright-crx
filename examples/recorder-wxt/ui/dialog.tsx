import React, { useEffect, useRef } from 'react';
import './dialog.css';

export function Dialog({ message, onClose }: { message: string, onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return <dialog ref={ref} onClose={onClose}>
    <p>{message}</p>
    <form method='dialog'>
      <button>OK</button>
    </form>
  </dialog>;
} 