import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { i18n as i18nType } from 'i18next';
import { writable } from 'svelte/store';

const createI18nStore = (i18n: i18nType) => {
	const i18nWritable = writable(i18n);

	i18n.on('initialized', () => {
		i18nWritable.set(i18n);
	});
	i18n.on('loaded', () => {
		i18nWritable.set(i18n);
	});
	i18n.on('added', () => i18nWritable.set(i18n));
	i18n.on('languageChanged', () => {
		i18nWritable.set(i18n);
	});
	return i18nWritable;
};

const createIsLoadingStore = (i18n: i18nType) => {
	const isLoading = writable(false);

	// if loaded resources are empty || {}, set loading to true
	i18n.on('loaded', (resources) => {
		// console.log('loaded:', resources);
		isLoading.set(Object.keys(resources).length === 0);
	});

	// if resources failed loading, set loading to true
	i18n.on('failedLoading', () => {
		isLoading.set(true);
	});

	return isLoading;
};

export const initI18n = (defaultLocale?: string | undefined) => {
    const detectionOrder = defaultLocale
        ? ['querystring', 'localStorage']
        : ['querystring', 'localStorage', 'navigator'];
    
    // Ndryshuar nga 'al-AL' në 'sq' (ose 'sq-AL' sipas emërtimit të dosjeve tuaja)
    const fallbackDefaultLocale = defaultLocale ? [defaultLocale] : ['sq'];

    const loadResource = (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`);

    i18next
        .use(resourcesToBackend(loadResource))
        .use(LanguageDetector)
        .init({
            debug: false,
            lng: defaultLocale || 'sq-AL', // Detyron përdorimin e shqipes nëse nuk ka defaultLocale
            detection: {
                order: detectionOrder,
                caches: ['localStorage'],
                lookupQuerystring: 'lang',
                lookupLocalStorage: 'locale'
            },
            fallbackLng: {
                default: fallbackDefaultLocale
            },
            ns: 'translation',
            returnEmptyString: false,
            interpolation: {
                escapeValue: false // nuk nevojitet për svelte pasi i bën escape vetë
            }
        });

    const lang = i18next?.language || defaultLocale || 'sq-AL';
    document.documentElement.setAttribute('lang', lang);
};

const i18n = createI18nStore(i18next);
const isLoadingStore = createIsLoadingStore(i18next);

export const getLanguages = async () => {
	const languages = (await import(`./locales/languages.json`)).default;
	return languages;
};
export const changeLanguage = (lang: string) => {
	document.documentElement.setAttribute('lang', lang);
	i18next.changeLanguage(lang);
};

export default i18n;
export const isLoading = isLoadingStore;
