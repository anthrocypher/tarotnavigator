#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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