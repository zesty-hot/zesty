import { redirect } from 'next/navigation';
import Negotiator from 'negotiator';
import { headers } from 'next/headers';
import { locales } from '@/lib/i18n/config';

export default async function RootPage() {
  // Get the accept-language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  
  // Default to English if no header is present
  if (!acceptLanguage) {
    redirect('/en');
  }

  // Use negotiator to find the best matching locale
  const negotiator = new Negotiator({ headers: { 'accept-language': acceptLanguage } });
  const preferredLocales = negotiator.languages();
  
  // Find the first supported locale from the browser preferences
  const supportedLocale = preferredLocales.find((locale: string) => {
    // Check exact match first
    if (locales.includes(locale as any)) {
      return true;
    }
    
    // Check language code without region (e.g., 'en-US' -> 'en')
    const languageCode = locale.split('-')[0];
    return locales.includes(languageCode as any);
  });
  
  // If we found a supported locale, use it (or its language code)
  if (supportedLocale) {
    const finalLocale = locales.includes(supportedLocale as any) 
      ? supportedLocale 
      : supportedLocale.split('-')[0];
    
    if (locales.includes(finalLocale as any)) {
      redirect(`/${finalLocale}`);
    }
  }
  
  // Fall back to English if no match found
  redirect('/en');
}