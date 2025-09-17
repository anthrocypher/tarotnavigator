#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const program = new Command();
const mappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
);

program
  .name('mapper')
  .description('CLI to map identifiers to values, suits, and lines')
  .version('1.0.0')
  .argument('<identifier>', 'code to lookup')
  .option('-l, --line <num>', 'specific line number (1, 2, or 3)')
  .action((identifier, options) => {
    const result = mappings[identifier];
    
    if (!result) {
      console.log('No mapping found for:', identifier);
      return;
    }

    console.log(`\n=== Results for ${identifier} ===`);
    
    // Values
    console.log('\nValues:');
    result.values.forEach(item => console.log(`  - ${item}`));
    
    // Suits (main suits)
    console.log('\nSuits:');
    result.suits.main_suits.forEach(item => console.log(`  - ${item}`));
    
    // Lines (subcategory of suits)
    console.log('\nLines:');
    if (options.line) {
      const lineKey = `line${options.line}`;
      if (result.suits.lines[lineKey]) {
        console.log(`  Line ${options.line}:`);
        result.suits.lines[lineKey].forEach(item => console.log(`    - ${item}`));
      } else {
        console.log(`  Invalid line number: ${options.line} (use 1, 2, or 3)`);
      }
    } else {
      // Randomly select one line
      const lineKeys = Object.keys(result.suits.lines);
      const randomLine = lineKeys[Math.floor(Math.random() * lineKeys.length)];
      const lineNumber = randomLine.replace('line', '');
      console.log(`  Line ${lineNumber} (randomly selected):`);
      result.suits.lines[randomLine].forEach(item => console.log(`    - ${item}`));
    }
  });

// Add a command to list all available identifiers
program
  .command('list')
  .description('List all available identifiers')
  .action(() => {
    const identifiers = Object.keys(mappings);
    console.log(`\nAvailable identifiers (${identifiers.length} total):`);
    identifiers.forEach(id => console.log(`  - ${id}`));
  });

program.parse();