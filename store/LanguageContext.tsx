import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { es, en, getDefaultLang, setCurrentT, Translations } from '../i18n';

const LANG_KEY = '@quehay_lang';
const LANG_CHOSEN_KEY = '@quehay_lang_chosen';

type Language = 'en' | 'es';

interface LanguageContextType {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isFirstLaunch: boolean;
  markLanguageChosen: () => void;
  langLoaded: boolean;
}

const translationMap: Record<Language, Translations> = { es, en };

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const defaultLang = getDefaultLang();
  const [language, setLang] = useState<Language>(defaultLang);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [langLoaded, setLangLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const [stored, chosen] = await Promise.all([
        AsyncStorage.getItem(LANG_KEY),
        AsyncStorage.getItem(LANG_CHOSEN_KEY),
      ]);
      const lang: Language = stored === 'en' || stored === 'es' ? stored : defaultLang;
      setCurrentT(lang);
      setLang(lang);
      if (!chosen) {
        setIsFirstLaunch(true);
      }
      setLangLoaded(true);
    }
    init();
  }, []);

  async function setLanguage(lang: Language) {
    setCurrentT(lang);
    setLang(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  }

  function markLanguageChosen() {
    setIsFirstLaunch(false);
    AsyncStorage.setItem(LANG_CHOSEN_KEY, 'true');
  }

  return (
    <LanguageContext.Provider
      value={{
        t: translationMap[language],
        language,
        setLanguage,
        isFirstLaunch,
        markLanguageChosen,
        langLoaded,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
