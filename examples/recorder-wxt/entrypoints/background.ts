import { defineBackground } from 'wxt/entrypoints';
import { storage } from 'wxt/storage';
import type { Mode } from '@recorder/recorderTypes';
import type { CrxApplication } from 'playwright-crx';
import playwright, { crx, _debug, _setUnderTest, _isUnderTest as isUnderTest } from 'playwright-crx';
import type { CrxSettings } from '../ui/settings';
import { addSettingsChangedListener, defaultSettings } from '../ui/settings';

type CrxMode = Mode | 'detached';

const stoppedModes: CrxMode[] = ['none', 'standby', 'detached'];
const recordingModes: CrxMode[] = ['recording', 'assertingText', 'assertingVisibility', 'assertingValue', 'assertingSnapshot'];

// we must lazy initialize it
let crxAppPromise: Promise<CrxApplication> | undefined;

const attachedTabIds = new Set<number>();
let currentMode: CrxMode | 'detached' | undefined;
let settings: CrxSettings;

export default defineBackground(() => {
  settings = defaultSettings;
  // if it's in sidepanel mode, we need to open it synchronously on action click,
  // so we need to fetch its value asap
  const settingsInitializing = storage.getItem('local:settings').then((s: CrxSettings) => settings = (s || defaultSettings) as CrxSettings).catch(() => {});

  addSettingsChangedListener((newSettings: CrxSettings) => {
    settings = newSettings;
    setTestIdAttributeName(newSettings.testIdAttributeName);
  });

  let allowsIncognitoAccess = false;
  chrome.extension.isAllowedIncognitoAccess().then((allowed: boolean) => {
    allowsIncognitoAccess = allowed;
  });

  async function changeAction(tabId: number, mode?: CrxMode | 'detached') {
    if (!mode)
      mode = attachedTabIds.has(tabId) ? currentMode : 'detached';
    else if (mode !== 'detached')
      currentMode = mode;


    // detached basically implies recorder windows was closed
    if (!mode || stoppedModes.includes(mode)) {
      await Promise.all([
        chrome.action.setTitle({ title: mode === 'none' ? 'Stopped' : 'Record', tabId }),
        chrome.action.setBadgeText({ text: '', tabId }),
      ]).catch(() => {});
      return;
    }

    const { text, title, color, bgColor } = recordingModes.includes(mode) ?
      { text: 'REC', title: 'Recording', color: 'white', bgColor: 'darkred' } :
      { text: 'INS', title: 'Inspecting', color: 'white', bgColor: 'dodgerblue' };

    await Promise.all([
      chrome.action.setTitle({ title, tabId }),
      chrome.action.setBadgeText({ text, tabId }),
      chrome.action.setBadgeTextColor({ color, tabId }),
      chrome.action.setBadgeBackgroundColor({ color: bgColor, tabId }),
    ]).catch(() => {});
  }

  // action state per tab is reset every time a navigation occurs
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1450904
  chrome.tabs.onUpdated.addListener((tabId: number) => changeAction(tabId));

  async function getCrxApp(incognito: boolean) {
    if (!crxAppPromise) {
      await settingsInitializing;

      crxAppPromise = crx.start({ incognito }).then(crxApp => {
        crxApp.recorder.addListener('hide', async () => {
          await crxApp.close();
          crxAppPromise = undefined;
        });
        crxApp.recorder.addListener('modechanged', async ({ mode }) => {
          await Promise.all([...attachedTabIds].map(tabId => changeAction(tabId, mode)));
        });
        crxApp.addListener('attached', async ({ tabId }) => {
          attachedTabIds.add(tabId);
          await changeAction(tabId, crxApp.recorder.mode());
        });
        crxApp.addListener('detached', async (tabId: number) => {
          attachedTabIds.delete(tabId);
          await changeAction(tabId, 'detached');
        });
        setTestIdAttributeName(settings.testIdAttributeName);
        return crxApp;
      });
    }
    return await crxAppPromise;
  }

  async function attach(tab: chrome.tabs.Tab, mode?: Mode) {
    if (!tab?.id || (attachedTabIds.has(tab.id) && !mode))
      return;

    // if the tab is incognito, chek if can be started in incognito mode.
    if (tab.incognito && !allowsIncognitoAccess)
      throw new Error('Not authorized to launch in Incognito mode.');

    const sidepanel = !isUnderTest() && settings.sidepanel;

    // we need to open sidepanel before any async call
    if (sidepanel)
      await chrome.sidePanel.open({ windowId: tab.windowId });

    // ensure one attachment at a time
    chrome.action.disable();
    if (tab.url?.startsWith('chrome://')) {
      const windowId = tab.windowId;
      tab = await new Promise<chrome.tabs.Tab>(resolve => {
        // we will not be able to attach to this tab, so we need to open a new one
        chrome.tabs.create({ windowId, url: 'about:blank' }).
            then((tab: chrome.tabs.Tab) => {
              resolve(tab);
            }).
            catch(() => {});
      });
    }

    const crxApp = await getCrxApp(tab.incognito);

    try {

      if (crxApp.recorder.isHidden()) {
        await crxApp.recorder.show({
          mode: mode ?? 'recording',
          language: settings.targetLanguage,
          window: { type: sidepanel ? 'sidepanel' : 'popup', url: 'index.html' },
          playInIncognito: settings.playInIncognito,
        });
      }

      await crxApp.attach(tab.id!);

      if (mode)
        await crxApp.recorder.setMode(mode);
    } finally {
      chrome.action.enable();
    }
  }

  async function setTestIdAttributeName(testIdAttributeName: string) {
    playwright.selectors.setTestIdAttribute(testIdAttributeName);
  }

  chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => attach(tab));

  chrome.contextMenus.create({
    id: 'pw-recorder',
    title: 'Attach to Playwright Recorder',
    contexts: ['all'],
  });

  chrome.contextMenus.onClicked.addListener(async (_, tab?: chrome.tabs.Tab) => {
    if (tab)
      await attach(tab);
  });

  chrome.commands.onCommand.addListener(async (command: string, tab: chrome.tabs.Tab) => {
    if (!tab.id)
      return;
    if (command === 'inspect')
      await attach(tab, 'inspecting');
    else if (command === 'record')
      await attach(tab, 'recording');
  });

  async function getStorageState() {
    const crxApp = await crxAppPromise;
    if (!crxApp)
      return;

    return await crxApp.context().storageState();
  }

  chrome.runtime.onMessage.addListener((message: any, _: any, sendResponse: (response: any) => void) => {
    if (message.event === 'storageStateRequested') {
      getStorageState().then(sendResponse).catch(() => {});
      return true;
    }
  });

  chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if ((globalThis as any).__crxTest)
      return;
    if ([chrome.runtime.OnInstalledReason.INSTALL, chrome.runtime.OnInstalledReason.UPDATE].includes(details.reason as any))
      chrome.tabs.create({ url: `https://github.com/ruifigueira/playwright-crx/releases/tag/v${chrome.runtime.getManifest().version}` }).catch(() => {});
  });

  // for testing
  Object.assign(self, { attach, setTestIdAttributeName, getCrxApp, _debug, _setUnderTest });
});
