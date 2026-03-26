export const supportedFormLanguages = ['en', 'ar', 'fa'] as const;

export type FormLanguage = (typeof supportedFormLanguages)[number];

export function normalizeFormLanguage(
  value: string | null | undefined
): FormLanguage {
  if (value === 'ar' || value === 'fa') {
    return value;
  }

  return 'en';
}

export function getFormDirection(language: FormLanguage) {
  return language === 'ar' || language === 'fa' ? 'rtl' : 'ltr';
}
