#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Load your mappings
const mappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
);

program
  .argument('<input>', 'string to map')
  .action((input) => {
    const cardCategories = mappings[input];
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
  });

program.parse();