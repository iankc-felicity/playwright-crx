import React from 'react';
import ReactDOM from 'react-dom/client';
import { PreferencesForm } from '../ui/preferencesForm';
import '../assets/preferences.css';

export default function main() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <PreferencesForm />
    </React.StrictMode>,
  );
} 