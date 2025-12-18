#!/usr/bin/env node
const { Command } = require('commander');
const { lookupCard } = require('./src/cardLookup');
const { showMainMenu } = require('./src/menus/mainMenu');

const program = new Command();

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
