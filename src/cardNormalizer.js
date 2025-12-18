// Normalize input to match our internal card identifiers
function normalizeCardInput(input) {
  let normalized = input.toLowerCase().trim();

  // Strip "the " prefix if present (for Major Arcana cards like "The Fool")
  if (normalized.startsWith('the ')) {
    normalized = normalized.substring(4);
  }

  // Map of Major Arcana aliases to canonical names
  const majorArcanaAliases = {
    'le mat': 'fool',
    'magus': 'magician',
    'le bateleur': 'magician',
    'priestess': 'high-priestess',
    'la papesse': 'high-priestess',
    'pope': 'hierophant',
    'lust': 'strength',
    'adjustment': 'justice',
    'hanged man': 'suspension',
    'art': 'temperance',
    'aeon': 'judgement',
    'universe': 'world'
  };

  // Check if input matches a Major Arcana alias
  if (majorArcanaAliases[normalized]) {
    return majorArcanaAliases[normalized];
  }

  // Map of number words to digits for Cups cards
  const numberWords = {
    'ace': 'ace',
    'one': '1',
    'two': '2',
    'three': '3',
    'four': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8',
    'nine': '9',
    'ten': '10'
  };

  // Handle numbered cards (Ace-10) for all suits
  const suits = ['cups', 'swords', 'wands', 'pentacles'];

  for (const suit of suits) {
    for (const [word, digit] of Object.entries(numberWords)) {
      const variations = [
        `${word} of ${suit}`,
        `${digit} of ${suit}`,
        `${word} ${suit}`,
        `${digit} ${suit}`
      ];

      if (variations.includes(normalized)) {
        return `${digit}-${suit}`;
      }
    }
  }

  // Handle court cards for all suits
  const courtCards = ['page', 'knight', 'queen', 'king'];
  for (const suit of suits) {
    for (const court of courtCards) {
      const variations = [
        `${court} of ${suit}`,
        `${court} ${suit}`
      ];

      if (variations.includes(normalized)) {
        return `${court}-${suit}`;
      }
    }
  }

  // Replace spaces with hyphens for canonical card name matching
  // (e.g., "high priestess" -> "high-priestess", "wheel of fortune" -> "wheel-of-fortune")
  // This handles Major Arcana multi-word names that didn't match aliases or minor arcana patterns
  normalized = normalized.replace(/\s+/g, '-');

  // Return normalized input
  return normalized;
}

module.exports = {
  normalizeCardInput
};
