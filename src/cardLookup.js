const fs = require('fs');
const path = require('path');
const { normalizeCardInput } = require('./cardNormalizer');

// Load mappings data
const mappings = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data.json'), 'utf8')
);

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

// Export mappings so other modules can access it
function getMappings() {
  return mappings;
}

module.exports = {
  lookupCard,
  getMappings
};
