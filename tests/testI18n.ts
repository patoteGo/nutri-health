import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Minimal translation resources for test purposes
const resources = {
  en: {
    translation: {
      ingredient_egg: 'Egg',
      ingredient_brown_rice: 'Brown Rice',
      ingredient_chicken_breast: 'Chicken Breast',
      ingredient_apple: 'Apple',
      ingredient_rice: 'Rice',
      ingredient_quinoa: 'Quinoa',
      ingredient_almond: 'Almond',
    },
  },
  pt: {
    translation: {
      ingredient_egg: 'Ovo',
      ingredient_brown_rice: 'Arroz Integral',
      ingredient_chicken_breast: 'Peito de Frango',
      ingredient_apple: 'Maçã',
      ingredient_rice: 'Arroz',
      ingredient_quinoa: 'Quinoa',
      ingredient_almond: 'Amêndoa',
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: { escapeValue: false },
  });
}

export default i18n;
