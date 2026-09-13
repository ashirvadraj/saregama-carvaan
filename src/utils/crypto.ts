import CryptoJS from 'crypto-js';

const SAAVN_DES_KEY = '38346591';

export function decryptMediaUrl(encrypted: string | undefined): string | null {
  if (!encrypted) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse(SAAVN_DES_KEY);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encrypted),
    });
    const decrypted = CryptoJS.DES.decrypt(
      cipherParams,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
    if (!rawUrl) return null;

    return rawUrl
      .replace('_96.mp4', '_160.mp4')
      .replace('_96.m4a', '_160.m4a')
      .replace('_48.mp4', '_160.mp4');
  } catch (err) {
    console.warn('Failed to decrypt audio URL:', err);
    return null;
  }
}