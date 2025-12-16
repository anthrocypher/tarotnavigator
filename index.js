#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const program = new Command();

// Load your mappings
const mappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
);

// Chalk for terminal colors (transitive dependency from inquirer)
const chalk = require('chalk');

// Breadcrumb management functions
function createBreadcrumb() {
  return { trail: [] };
}

function addBreadcrumbStep(breadcrumb, prompt, selection) {
  return {
    trail: [...breadcrumb.trail, { prompt, selection }]
  };
}

function formatBreadcrumb(breadcrumb) {
  if (breadcrumb.trail.length === 0) {
    return '';
  }

  const formatted = breadcrumb.trail
    .map(step => chalk.blue(step.selection))
    .join(' → ');

  return '\n' + formatted + '\n';
}

function displayBreadcrumb(breadcrumb) {
  const formatted = formatBreadcrumb(breadcrumb);
  if (formatted) {
    console.log(formatted);
  }
}

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

// Perform card lookup and display results
function lookupCard(input) {
  const normalizedInput = normalizeCardInput(input);
  const cardCategories = mappings[normalizedInput];
  if (cardCategories && Array.isArray(cardCategories)) {
    // Get outputs from all categories for this card
    const allOutputs = [];
    for (const category of cardCategories) {
      const categoryOutputs = mappings[category];
      if (categoryOutputs && Array.isArray(categoryOutputs)) {
        allOutputs.push(...categoryOutputs);
      }
    }

    if (allOutputs.length > 0) {
      console.log('\n' + allOutputs.join('\n\n') + '\n');
    } else {
      console.log('No outputs defined for card categories:', cardCategories.join(', '));
    }
  } else {
    console.log('No mapping found for:', input);
  }
}

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

// ===== Menu System Functions =====

// Display a card and ask if user wants to continue
async function displayCardAndPrompt(cardKey, breadcrumb = createBreadcrumb()) {
  console.log('\n' + '='.repeat(50));
  console.log(formatCardName(cardKey).toUpperCase());
  console.log('='.repeat(50));

  // Display breadcrumb trail showing complete navigation path
  displayBreadcrumb(breadcrumb);

  lookupCard(cardKey);

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Return to Main Menu', value: 'menu' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'menu') {
    // Reset breadcrumb when returning to main menu
    await showMainMenu(createBreadcrumb());
  } else {
    console.log('\nGoodbye!');
    process.exit(0);
  }
}

// Main menu
async function showMainMenu(breadcrumb = createBreadcrumb()) {
  console.log('\n' + '='.repeat(50));
  console.log('TAROT NAVIGATOR - Main Menu');
  console.log('='.repeat(50) + '\n');

  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Select an option:',
      choices: [
        { name: 'Browse by Category (Major/Minor Arcana)', value: 'category' },
        { name: 'Browse by Suit', value: 'suit' },
        { name: 'Browse by Type (Court/Numbered/Major)', value: 'type' },
        { name: 'Search for a Card', value: 'search' },
        new inquirer.Separator(),
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  switch (choice) {
    case 'category':
      const categoryBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Browse by Category (Major/Minor Arcana)');
      await browseByCategory(categoryBreadcrumb);
      break;
    case 'suit':
      const suitBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Browse by Suit');
      await browseBySuit(suitBreadcrumb);
      break;
    case 'type':
      const typeBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Browse by Type (Court/Numbered/Major)');
      await browseByType(typeBreadcrumb);
      break;
    case 'search':
      const searchBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Search for a Card');
      await searchCardsMenu(searchBreadcrumb);
      break;
    case 'exit':
      console.log('\nGoodbye!');
      process.exit(0);
      break;
  }
}

// Browse by Category submenu
async function browseByCategory(breadcrumb = createBreadcrumb()) {
  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  const { categoryChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'categoryChoice',
      message: 'Select a category:',
      choices: [
        { name: 'Major Arcana', value: 'major' },
        { name: 'Minor Arcana', value: 'minor' },
        new inquirer.Separator(),
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);

  if (categoryChoice === 'back') {
    await showMainMenu(breadcrumb);
    return;
  }

  if (categoryChoice === 'major') {
    const majorBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select a category:', 'Major Arcana');
    await browseMajorArcana(majorBreadcrumb);
  } else if (categoryChoice === 'minor') {
    const minorBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select a category:', 'Minor Arcana');
    await browseMinorArcana(minorBreadcrumb);
  }
}

// Browse Major Arcana with line filtering
async function browseMajorArcana(breadcrumb = createBreadcrumb()) {
  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  const { lineChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'lineChoice',
      message: 'Select a line:',
      choices: [
        { name: 'Line 1 (Foundational identity, showing up in the world)', value: 'line1' },
        { name: 'Line 2 (In-betweenness, going within)', value: 'line2' },
        { name: 'Line 3 (Healing, moving to higher selves)', value: 'line3' },
        { name: 'All Major Arcana', value: 'all' },
        new inquirer.Separator(),
        { name: 'Back', value: 'back' }
      ]
    }
  ]);

  if (lineChoice === 'back') {
    await browseByCategory(breadcrumb);
    return;
  }

  let cards;
  let selectionText;

  // Map verbose choice text to concise breadcrumb text
  const lineMap = {
    'line1': 'Line 1',
    'line2': 'Line 2',
    'line3': 'Line 3',
    'all': 'All Major Arcana'
  };

  if (lineChoice === 'all') {
    cards = getAllMajorArcana();
  } else {
    cards = getMajorArcanaByLine(lineChoice);
  }

  selectionText = lineMap[lineChoice];
  const newBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select a line:', selectionText);
  await selectFromCardList(cards, browseMajorArcana, newBreadcrumb, 'Select a card:');
}

// Browse Minor Arcana
async function browseMinorArcana(breadcrumb = createBreadcrumb()) {
  const minorCards = getAllCards().filter(card => {
    const categories = mappings[card];
    return categories && !categories.includes('majors');
  });

  await selectFromCardList(minorCards, browseMinorArcana, breadcrumb, 'Select a card:');
}

// Generic card selection from a list
async function selectFromCardList(cards, returnFunction, breadcrumb = createBreadcrumb(), promptText = 'Select a card:') {
  if (cards.length === 0) {
    console.log('\nNo cards found in this category.');
    await returnFunction(breadcrumb);
    return;
  }

  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  // Build choices array
  const cardChoices = cards.map(card => ({
    name: formatCardName(card),
    value: card
  }));

  const choices = [
    ...cardChoices,
    new inquirer.Separator(),
    { name: 'Back', value: 'back' }
  ];

  const { selectedCard } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCard',
      message: promptText,
      choices: choices,
      pageSize: 15,
      loop: false
    }
  ]);

  if (selectedCard === 'back') {
    await returnFunction(breadcrumb);
  } else {
    const newBreadcrumb = addBreadcrumbStep(breadcrumb, promptText, formatCardName(selectedCard));
    await displayCardAndPrompt(selectedCard, newBreadcrumb);
  }
}

async function browseBySuit(breadcrumb = createBreadcrumb()) {
  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  const { suitChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'suitChoice',
      message: 'Select a suit:',
      choices: [
        { name: 'Cups (Emotional lives, relationships)', value: 'cups' },
        { name: 'Pentacles (Life\'s work, making vision tangible)', value: 'pentacles' },
        { name: 'Swords (Communication, mindfulness, truth)', value: 'swords' },
        { name: 'Wands (Physical energy, respecting limits)', value: 'wands' },
        new inquirer.Separator(),
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);

  if (suitChoice === 'back') {
    await showMainMenu(breadcrumb);
    return;
  }

  // Map verbose suit names to concise breadcrumb text
  const suitMap = {
    'cups': 'Cups',
    'pentacles': 'Pentacles',
    'swords': 'Swords',
    'wands': 'Wands'
  };

  // Add suit to breadcrumb
  const breadcrumbAfterSuit = addBreadcrumbStep(breadcrumb, 'Select a suit:', suitMap[suitChoice]);

  // Display updated breadcrumb for filter question
  displayBreadcrumb(breadcrumbAfterSuit);

  // Ask for filtering preference
  const { filterChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'filterChoice',
      message: 'How would you like to view these cards?',
      choices: [
        { name: 'Show All Cards', value: 'all' },
        { name: 'Court Cards (Page, Knight, Queen, King)', value: 'court' },
        { name: 'Numbered Cards (Ace through 10)', value: 'numbered' },
        new inquirer.Separator(),
        { name: 'Back', value: 'back' }
      ]
    }
  ]);

  if (filterChoice === 'back') {
    await browseBySuit(breadcrumb);
    return;
  }

  // Get filtered cards based on choice
  let suitCards;
  let filterText;

  if (filterChoice === 'all') {
    suitCards = getCardsBySuit(suitChoice);
    filterText = 'Show All Cards';
  } else if (filterChoice === 'court') {
    suitCards = getCourtCardsBySuit(suitChoice);
    filterText = 'Court Cards';
  } else if (filterChoice === 'numbered') {
    suitCards = getNumberedCardsBySuit(suitChoice);
    filterText = 'Numbered Cards';
  }

  const finalBreadcrumb = addBreadcrumbStep(breadcrumbAfterSuit, 'How would you like to view these cards?', filterText);
  await selectFromCardList(suitCards, browseBySuit, finalBreadcrumb, 'Select a card:');
}

async function browseByType(breadcrumb = createBreadcrumb()) {
  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  const { typeChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'typeChoice',
      message: 'Select a type:',
      choices: [
        { name: 'Major Arcana', value: 'major' },
        { name: 'Court Cards (Page, Knight, Queen, King)', value: 'court' },
        { name: 'Numbered Cards (Ace through 10)', value: 'numbered' },
        new inquirer.Separator(),
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);

  if (typeChoice === 'back') {
    await showMainMenu(breadcrumb);
    return;
  }

  // Map type choice to display text
  const typeMap = {
    'major': 'Major Arcana',
    'court': 'Court Cards',
    'numbered': 'Numbered Cards'
  };

  let cards;
  const breadcrumbAfterType = addBreadcrumbStep(breadcrumb, 'Select a type:', typeMap[typeChoice]);

  // Major Arcana don't have suits, so show them directly
  if (typeChoice === 'major') {
    cards = getAllMajorArcana();
    await selectFromCardList(cards, browseByType, breadcrumbAfterType, 'Select a card:');
    return;
  }

  // For Court and Numbered cards, offer suit filtering
  // Display updated breadcrumb
  displayBreadcrumb(breadcrumbAfterType);

  const { suitFilter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'suitFilter',
      message: 'Filter by suit?',
      choices: [
        { name: 'Show All Suits', value: 'all' },
        { name: 'Cups', value: 'cups' },
        { name: 'Pentacles', value: 'pentacles' },
        { name: 'Swords', value: 'swords' },
        { name: 'Wands', value: 'wands' },
        new inquirer.Separator(),
        { name: 'Back', value: 'back' }
      ]
    }
  ]);

  if (suitFilter === 'back') {
    await browseByType(breadcrumb);
    return;
  }

  // Get cards based on type
  if (typeChoice === 'court') {
    cards = getCourtCards();
  } else if (typeChoice === 'numbered') {
    cards = getNumberedCards();
  }

  // Filter by suit if not 'all'
  let filterText;
  if (suitFilter !== 'all') {
    cards = filterCardsBySuit(cards, suitFilter);
    const suitMap = {
      'cups': 'Cups',
      'pentacles': 'Pentacles',
      'swords': 'Swords',
      'wands': 'Wands'
    };
    filterText = suitMap[suitFilter];
  } else {
    filterText = 'Show All Suits';
  }

  const finalBreadcrumb = addBreadcrumbStep(breadcrumbAfterType, 'Filter by suit?', filterText);
  await selectFromCardList(cards, browseByType, finalBreadcrumb, 'Select a card:');
}

async function searchCardsMenu(breadcrumb = createBreadcrumb()) {
  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

  const { searchQuery } = await inquirer.prompt([
    {
      type: 'input',
      name: 'searchQuery',
      message: 'Enter search term (or press Enter to go back):'
    }
  ]);

  if (!searchQuery || searchQuery.trim() === '') {
    await showMainMenu(breadcrumb);
    return;
  }

  const results = searchCards(searchQuery);

  if (results.length === 0) {
    console.log(`\nNo cards found matching "${searchQuery}"`);
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Search again', value: 'search' },
          { name: 'Back to Main Menu', value: 'menu' }
        ]
      }
    ]);

    if (action === 'search') {
      await searchCardsMenu(breadcrumb);
    } else {
      await showMainMenu(breadcrumb);
    }
    return;
  }

  console.log(`\nFound ${results.length} card(s) matching "${searchQuery}"\n`);

  // Truncate long search queries for breadcrumb display
  const displayQuery = searchQuery.length > 30 ? searchQuery.substring(0, 27) + '...' : searchQuery;
  const newBreadcrumb = addBreadcrumbStep(breadcrumb, 'Search:', displayQuery);

  await selectFromCardList(results, searchCardsMenu, newBreadcrumb, 'Select a card:');
}

async function showRandomCard() {
  const randomCard = getRandomCard();
  await displayCardAndPrompt(randomCard);
}

// CLI entry point
program
  .argument('[input]', 'Card name to look up (optional - omit to launch interactive menu)')
  .action(async (input) => {
    if (input) {
      // Single-shot lookup mode
      lookupCard(input);
    } else {
      // Interactive menu mode
      await showMainMenu();
    }
  });

program.parse();