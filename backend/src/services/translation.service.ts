// @ts-ignore
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const DEEPL_API_KEY = process.env.DEEPL_API_KEY as string;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

if (!DEEPL_API_KEY) {
  throw new Error('Falta la variable de entorno DEEPL_API_KEY');
}

/**
 * Traduce texto usando la API de DeepL
 * @param text Texto a traducir
 * @param target Idioma destino (por ejemplo, 'EN')
 * @returns Traducción
 */
export async function translate(text: string, target: 'EN'): Promise<string> {
  const params = new URLSearchParams();
  params.append('auth_key', DEEPL_API_KEY);
  params.append('text', text);
  params.append('target_lang', target);
  params.append('source_lang', 'ES');

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepL API error: ${error}`);
  }

  const data = await response.json();
  if (!data.translations || !data.translations[0]?.text) {
    throw new Error('Respuesta inesperada de DeepL');
  }
  return data.translations[0].text;
} 