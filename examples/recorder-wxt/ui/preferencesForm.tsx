import { Dialog } from './dialog';
import React, { useEffect, useState } from 'react';
import { defaultSettings, loadSettings, saveSettings } from './settings';
import type { CrxSettings } from './settings';

export function PreferencesForm() {
  const [settings, setSettings] = useState<CrxSettings>(defaultSettings);
  const [dialog, setDialog] = useState<any>();

  useEffect(() => {
    loadSettings().then(s => setSettings(s as CrxSettings));
  }, []);

  const onSave = () => {
    saveSettings(settings).then(() => {
      setDialog(<Dialog
        message='Settings saved'
        onClose={() => setDialog(null)}
      />);
    });
  };

  return <div className='preferences-form'>
    <div className='form-row'>
      <label>
        Test ID attribute name:
        <input type='text' value={settings.testIdAttributeName} onChange={e => {
          setSettings({ ...settings, testIdAttributeName: e.target.value });
        }} />
      </label>
    </div>
    <div className='form-row'>
      <label>
        <input type='checkbox' checked={settings.sidepanel} onChange={e => {
          setSettings({ ...settings, sidepanel: e.target.checked });
        }} />
        Open recorder in side panel
      </label>
    </div>
    <div className='form-row'>
      <label>
        Target language:
        <select value={settings.targetLanguage} onChange={e => {
          setSettings({ ...settings, targetLanguage: e.target.value });
        }}>
          <option value='playwright-test'>Playwright Test</option>
          <option value='library'>Library</option>
          <option value='python'>Python</option>
          <option value='python-async'>Python Async</option>
          <option value='python-pytest'>Python Pytest</option>
          <option value='java'>Java</option>
          <option value='csharp'>C#</option>
          <option value='csharp-mstest'>C# MSTest</option>
          <option value='csharp-nunit'>C# NUnit</option>
        </select>
      </label>
    </div>
    <div className='form-row'>
      <label>
        <input type='checkbox' checked={settings.playInIncognito} onChange={e => {
          setSettings({ ...settings, playInIncognito: e.target.checked });
        }} />
        Play in incognito mode
      </label>
    </div>
    <div className='form-row'>
      <button onClick={onSave}>Save</button>
    </div>
    {dialog}
  </div>;
} 