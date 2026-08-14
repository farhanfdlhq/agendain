import React, { ReactNode } from 'react';

/**
 * Parses a string containing asterisks into an array of React elements.
 * Text surrounded by asterisks (e.g., *Agendain*) will be wrapped in a span
 * with the specified CSS module class for gold text.
 * 
 * @param text The string to parse (e.g. "Apa itu *Agendain*?")
 * @param styles The CSS module object containing the styles (e.g. { textGold: '...' })
 * @param fontWeight Optional font weight to apply to the text
 * @returns ReactNode
 */
export function parseGoldText(text: string | undefined | null, styles: any, fontWeight?: string): ReactNode {
  if (!text) return null;

  const parts = text.split(/(\*[^*]+\*)/g);
  
  return (
    <span style={fontWeight ? { fontWeight: Number(fontWeight) } : undefined}>
      {parts.map((part, idx) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          const innerText = part.slice(1, -1);
          return (
            <span key={idx} className={styles.textGold}>
              {innerText}
            </span>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
}
