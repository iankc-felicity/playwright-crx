import React from 'react';
import { Recorder } from '@web/recorder';
import { SaveCodeForm } from './saveCodeForm';
import { Dialog } from './dialog';
import { showSaveFilePicker } from 'native-file-system-adapter';

export function CrxRecorder() {
  const [dialog, setDialog] = React.useState<any>();

  const onSave = async (filename: string, text: string) => {
    try {
      const handle = await showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'TypeScript file',
          accept: { 'application/typescript': ['.ts'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
    } catch (e: any) {
      setDialog(<Dialog
        message={e.message}
        onClose={() => setDialog(null)}
      />);
    }
  };

  return <Recorder
    onSave={onSave}
    saveCodeForm={SaveCodeForm}
    dialog={dialog}
  />;
} 