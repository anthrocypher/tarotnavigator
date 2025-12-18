const { getMappings } = require('./cardLookup');
const { normalizeCardInput } = require('./cardNormalizer');

const mappings = getMappings();

// ===== Helper Functions for Menu System =====

// Get all card keys (filter out category definitions)
function getAllCards() {
  const categories = ['cups', 'pentacles', 'swords', 'wands', 'majors',
                     'line1', 'line2', 'line3', 'ace', 'page', 'knight',
                     'queen', 'king', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  return Object.keys(mappings).filter(key => !categories.includes(key));
}

// Get all Major Arcana cards
function getAllMajorArcana() {
  return getAllCards().filter(card => {
    const categories = mappings[card];
    return categories && categories.includes('majors');
  });
}

// Get Major Arcana cards by line
function getMajorArcanaByLine(line) {
  return getAllMajorArcana().filter(card => {
    const categories = mappings[card];
    return categories && categories.includes(line);
  });
}

// Get all cards for a specific suit
function getCardsBySuit(suit) {
  return getAllCards().filter(card => {
    const categories = mappings[card];
    return categories && categories.includes(suit);
  });
}

// Get all court cards (Page, Knight, Queen, King)
function getCourtCards() {
  return getAllCards().filter(card => {
    const categories = mappings[card];
    return categories && ['page', 'knight', 'queen', 'king'].some(rank => categories.includes(rank));
  });
}

// Get all numbered cards (Ace through 10)
function getNumberedCards() {
  return getAllCards().filter(card => {
    const categories = mappings[card];
    return categories && ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10'].some(rank => categories.includes(rank));
  });
}

// ===== Cross-Category Filtering Functions =====

// Get court cards for a specific suit
function getCourtCardsBySuit(suit) {
  return getCourtCards().filter(card => {
    const categories = mappings[card];
    return categories && categories.includes(suit);
  });
}

// Get numbered cards for a specific suit
function getNumberedCardsBySuit(suit) {
  return getNumberedCards().filter(card => {
    const categories = mappings[card];
    return categories && categories.includes(suit);
  });
}

// Get cards by type filtered by suit (for Browse by Type → filter by suit)
function filterCardsBySuit(cards, suit) {
  return cards.filter(card => {
    const categories = mappings[card];
    return categories && categories.includes(suit);
  });
}

// Format card name for display (e.g., "ace-cups" -> "Ace of Cups")
function formatCardName(cardKey) {
  // Handle major arcana
  if (mappings[cardKey] && mappings[cardKey].includes('majors')) {
    return cardKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Handle minor arcana
  const parts = cardKey.split('-');
  if (parts.length === 2) {
    const [rank, suit] = parts;
    const formattedRank = rank.charAt(0).toUpperCase() + rank.slice(1);
    const formattedSuit = suit.charAt(0).toUpperCase() + suit.slice(1);
    return `${formattedRank} of ${formattedSuit}`;
  }

  return cardKey;
}

// Get a random card
function getRandomCard() {
  const allCards = getAllCards();
  return allCards[Math.floor(Math.random() * allCards.length)];
}

// Search cards by name
function searchCards(query) {
  const normalizedQuery = query.toLowerCase();
  const allCards = getAllCards();

  // First, try to normalize the input as if it's a card name
  const normalizedCardKey = normalizeCardInput(query);

  // Filter cards that match
  return allCards.filter(card => {
    const formattedName = formatCardName(card).toLowerCase();
    // Check if: formatted name includes query, card key includes query, or card key matches normalized input
    return formattedName.includes(normalizedQuery) ||
           card.includes(normalizedQuery) ||
           card === normalizedCardKey;
  });
}

module.exports = {
  getAllCards,
  getAllMajorArcana,
  getMajorArcanaByLine,
  getCardsBySuit,
  getCourtCards,
  getNumberedCards,
  getCourtCardsBySuit,
  getNumberedCardsBySuit,
  filterCardsBySuit,
  formatCardName,
  getRandomCard,
  searchCards
};
