import { Product, Story } from '../types';
import { getTelegramWebApp, isInsideTelegram, triggerHaptic } from './telegram';

export interface ShareData {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
}

export function getAppShareUrl(params?: Record<string, string>): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.set(key, val);
    });
  }

  return url.toString();
}

export function buildProductShareData(product: Product): ShareData {
  const minPrice = Math.min(...product.variants.filter(v => v.is_available).map(v => v.price), product.variants[0]?.price || 0);
  const notesStr = product.notes?.main?.slice(0, 4).join(', ') || '';
  
  const text = `✨ ${product.brand} — ${product.name}
💎 ${product.direction}
🌿 Ноты: ${notesStr}
💰 Распив от ${minPrice.toLocaleString('ru-RU')} ₽
🛍️ Бутик PARFUM.SELECTIVE`;

  const url = getAppShareUrl({ product: product.id });

  return {
    title: `${product.brand} — ${product.name} | PARFUM.SELECTIVE`,
    text,
    url,
    imageUrl: product.image_url
  };
}

export function buildStoreShareData(): ShareData {
  const text = `✨ PARFUM.SELECTIVE — эксклюзивная нишевая парфюмерия и оригинальный распив от 2 мл. Откройте для себя редкие селективные ароматы!`;
  const url = getAppShareUrl();

  return {
    title: 'PARFUM.SELECTIVE — Бутик нишевой парфюмерии',
    text,
    url
  };
}

export function buildStoryShareData(story: Story): ShareData {
  const text = `✨ ${story.title} в бутике нишевой парфюмерии PARFUM.SELECTIVE`;
  const url = getAppShareUrl({ story: story.id });

  return {
    title: `${story.title} | PARFUM.SELECTIVE`,
    text,
    url,
    imageUrl: story.avatarUrl
  };
}

export function openTelegramShare(data: ShareData): void {
  triggerHaptic('light');
  const tg = getTelegramWebApp();
  const shareText = `${data.text}\n\n${data.url}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`;

  if (tg && typeof tg.openTelegramLink === 'function') {
    tg.openTelegramLink(tgUrl);
  } else if (tg && typeof tg.openLink === 'function') {
    tg.openLink(tgUrl);
  } else {
    window.open(tgUrl, '_blank');
  }
}

export function openWhatsAppShare(data: ShareData): void {
  triggerHaptic('light');
  const shareText = `${data.text}\n\n${data.url}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(waUrl, '_blank');
}

export async function copyShareLink(data: ShareData): Promise<boolean> {
  triggerHaptic('success');
  const shareText = `${data.text}\n\n${data.url}`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch {
      // fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

export async function executeNativeShare(data: ShareData): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      triggerHaptic('light');
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('Native share failed:', e);
      }
      return false;
    }
  }
  return false;
}
