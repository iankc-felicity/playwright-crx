import React, { useState } from 'react';

export function SaveCodeForm({ onSave }: { onSave: (filename: string) => void }) {
  const [filename, setFilename] = useState('test.spec.ts');

  return <div className='save-code-form'>
    <div className='form-row'>
      <label>
        Filename:
        <input type='text' value={filename} onChange={e => setFilename(e.target.value)} />
      </label>
    </div>
    <div className='form-row'>
      <button onClick={() => onSave(filename)}>Save</button>
    </div>
  </div>;
} 