import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { LOCALE_STORAGE, LOCALES } from '@app/constants/locale';
import translationEn from '@app/locales/en.json';
import translationVi from '@app/locales/vi.json';

const localeStorage = localStorage.getItem(LOCALE_STORAGE);

const resources = {
  en: { translation: translationEn },
  vi: { translation: translationVi },
};

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: localeStorage ?? LOCALES.VI,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
