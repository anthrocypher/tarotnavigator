#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const inquirer = require('inquirer');

const program = new Command();

// Load your mappings
const mappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
);

// Normalize input to match our internal card identifiers
function normalizeCardInput(input) {
  const normalized = input.toLowerCase().trim();

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

  // Return original input if no match
  return input;
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
  return getAllCards().filter(card => {
    const formattedName = formatCardName(card).toLowerCase();
    return formattedName.includes(normalizedQuery) || card.includes(normalizedQuery);
  });
}

// ===== Menu System Functions =====

// Display a card and ask if user wants to continue
async function displayCardAndPrompt(cardKey) {
  console.log('\n' + '='.repeat(50));
  console.log(formatCardName(cardKey).toUpperCase());
  console.log('='.repeat(50));
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
    await showMainMenu();
  } else {
    console.log('\nGoodbye!');
    process.exit(0);
  }
}

// Main menu
async function showMainMenu() {
  console.log('\n' + '='.repeat(50));
  console.log('TAROT NAVIGATOR - Main Menu');
  console.log('='.repeat(50) + '\n');

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
        { name: 'Random Card', value: 'random' },
        new inquirer.Separator(),
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  switch (choice) {
    case 'category':
      await browseByCategory();
      break;
    case 'suit':
      await browseBySuit();
      break;
    case 'type':
      await browseByType();
      break;
    case 'search':
      await searchCardsMenu();
      break;
    case 'random':
      await showRandomCard();
      break;
    case 'exit':
      console.log('\nGoodbye!');
      process.exit(0);
      break;
  }
}

// Browse by Category submenu
async function browseByCategory() {
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
    await showMainMenu();
    return;
  }

  if (categoryChoice === 'major') {
    await browseMajorArcana();
  } else if (categoryChoice === 'minor') {
    await browseMinorArcana();
  }
}

// Browse Major Arcana with line filtering
async function browseMajorArcana() {
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
    await browseByCategory();
    return;
  }

  let cards;
  if (lineChoice === 'all') {
    cards = getAllMajorArcana();
  } else {
    cards = getMajorArcanaByLine(lineChoice);
  }

  await selectFromCardList(cards, browseMajorArcana);
}

// Browse Minor Arcana
async function browseMinorArcana() {
  const minorCards = getAllCards().filter(card => {
    const categories = mappings[card];
    return categories && !categories.includes('majors');
  });

  await selectFromCardList(minorCards, browseMinorArcana);
}

// Generic card selection from a list
async function selectFromCardList(cards, returnFunction) {
  if (cards.length === 0) {
    console.log('\nNo cards found in this category.');
    await returnFunction();
    return;
  }

  const choices = cards.map(card => ({
    name: formatCardName(card),
    value: card
  }));

  choices.push(new inquirer.Separator());
  choices.push({ name: 'Back', value: 'back' });

  const { selectedCard } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCard',
      message: 'Select a card:',
      choices: choices,
      pageSize: 15
    }
  ]);

  if (selectedCard === 'back') {
    await returnFunction();
  } else {
    await displayCardAndPrompt(selectedCard);
  }
}

async function browseBySuit() {
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
    await showMainMenu();
    return;
  }

  const suitCards = getCardsBySuit(suitChoice);
  await selectFromCardList(suitCards, browseBySuit);
}

async function browseByType() {
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
    await showMainMenu();
    return;
  }

  let cards;
  if (typeChoice === 'major') {
    cards = getAllMajorArcana();
  } else if (typeChoice === 'court') {
    cards = getCourtCards();
  } else if (typeChoice === 'numbered') {
    cards = getNumberedCards();
  }

  await selectFromCardList(cards, browseByType);
}

async function searchCardsMenu() {
  const { searchQuery } = await inquirer.prompt([
    {
      type: 'input',
      name: 'searchQuery',
      message: 'Enter search term (or press Enter to go back):'
    }
  ]);

  if (!searchQuery || searchQuery.trim() === '') {
    await showMainMenu();
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
      await searchCardsMenu();
    } else {
      await showMainMenu();
    }
    return;
  }

  console.log(`\nFound ${results.length} card(s) matching "${searchQuery}"\n`);
  await selectFromCardList(results, searchCardsMenu);
}

async function showRandomCard() {
  const randomCard = getRandomCard();
  await displayCardAndPrompt(randomCard);
}

// Start interactive REPL mode
function startInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Enter card: '
  });

  console.log('TarotNavigator - Interactive Mode');
  console.log('Type a card name to look it up\n');

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();

    if (input) {
      lookupCard(input);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

program
  .argument('<input>', 'string to map')
  .action((input) => {
    lookupCard(input);
  });

program.parse();