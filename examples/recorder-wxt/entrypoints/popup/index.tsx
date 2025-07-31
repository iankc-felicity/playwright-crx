import React from 'react';
import ReactDOM from 'react-dom/client';
import { CrxRecorder } from '../../ui/crxRecorder';
import '../../assets/crxRecorder.css';
import '@unocss/reset/tailwind.css';
import 'wxt/client';

export default function main() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <CrxRecorder />
    </React.StrictMode>,
  );
} 