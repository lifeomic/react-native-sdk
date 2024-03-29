import i18next, { configure } from '../../lib/i18n';

// Export all initialization helper functions, so one can create their
// own init.ts if needed.
export function initializeI18Next() {
  if (!i18next.isInitialized) {
    configure();
  }
}

export const init = () => {
  try {
    require('../../../../../plugins');
  } catch {
    // No plugins enabled for app
  }
  initializeI18Next();
};
