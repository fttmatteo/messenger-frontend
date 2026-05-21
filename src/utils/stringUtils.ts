export const capitalizePhrase = (text: string | null | undefined): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length === 0) return '';
  
  const connectors = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 'en', 'a', 'con', 'por', 'para'];
  
  return trimmed.split(/\s+/).map((word, index) => {
    const lowerWord = word.toLowerCase();
    if (index !== 0 && connectors.includes(lowerWord)) {
      return lowerWord;
    }
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  }).join(' ');
};
