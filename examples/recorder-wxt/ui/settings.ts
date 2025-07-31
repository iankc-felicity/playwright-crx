import { storage } from 'wxt/storage';

export type CrxSettings = {
  testIdAttributeName: string;
  sidepanel: boolean;
  targetLanguage: string;
  playInIncognito: boolean;
};

export const defaultSettings: CrxSettings = {
  testIdAttributeName: 'data-testid',
  sidepanel: true,
  targetLanguage: 'playwright-test',
  playInIncognito: false,
};

export async function loadSettings() {
  return await storage.getItem('local:settings') || defaultSettings;
}

export async function saveSettings(settings: CrxSettings) {
  await storage.setItem('local:settings', settings);
}

export function addSettingsChangedListener(callback: (settings: CrxSettings) => void) {
  storage.watch('local:settings', (newValue: CrxSettings) => callback(newValue));
} 