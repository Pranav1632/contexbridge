export interface ExtractedTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Universal chat DOM extractor supporting:
 * 1. Mock Chat Fixture (localhost:3000)
 * 2. ChatGPT (chatgpt.com)
 * 3. Claude (claude.ai)
 */
export function scrapeCurrentChat(): ExtractedTurn[] {
  const host = window.location.hostname;
  const turns: ExtractedTurn[] = [];

  // 1. Mock Chat Fixture
  if (host === 'localhost' || host === '127.0.0.1') {
    const messageElements = document.querySelectorAll('.message');
    messageElements.forEach((el) => {
      const role = el.getAttribute('data-role') === 'user' ? 'user' : 'assistant';
      const contentEl = el.querySelector('.content') || el;
      const text = contentEl.textContent?.trim() || '';
      if (text) {
        turns.push({ role, content: text });
      }
    });
    return turns;
  }

  // 2. ChatGPT Web (chatgpt.com)
  if (host.includes('chatgpt.com')) {
    const articles = document.querySelectorAll('article');
    articles.forEach((art) => {
      const isUser = art.querySelector('[data-message-author-role="user"]') !== null;
      const contentEl = art.querySelector('.whitespace-pre-wrap') || art;
      const text = contentEl.textContent?.trim() || '';
      if (text) {
        turns.push({ role: isUser ? 'user' : 'assistant', content: text });
      }
    });
    if (turns.length > 0) return turns;
  }

  // 3. Claude Web (claude.ai)
  if (host.includes('claude.ai')) {
    const humanMessages = document.querySelectorAll('.font-user-message');
    const assistantMessages = document.querySelectorAll('.font-claude-message');

    // Generic fallback for claude text blocks
    const chatBlocks = document.querySelectorAll('[data-is-streaming="false"], .standard-markdown');
    chatBlocks.forEach((block, idx) => {
      const text = block.textContent?.trim() || '';
      if (text) {
        turns.push({
          role: idx % 2 === 0 ? 'user' : 'assistant',
          content: text,
        });
      }
    });
    if (turns.length > 0) return turns;
  }

  // 4. Universal Fallback: scan paragraphs & code blocks
  const paragraphs = document.querySelectorAll('p, pre');
  let accumulated = '';
  paragraphs.forEach((p) => {
    const text = p.textContent?.trim();
    if (text && text.length > 20) {
      accumulated += text + '\n\n';
    }
  });

  if (accumulated) {
    turns.push({ role: 'user', content: 'Extracted active context from page' });
    turns.push({ role: 'assistant', content: accumulated });
  }

  return turns;
}
