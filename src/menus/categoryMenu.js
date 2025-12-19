const inquirer = require('inquirer');
const { createBreadcrumb, addBreadcrumbStep, displayBreadcrumb } = require('../breadcrumbs');
const { getAllCards, getAllMajorArcana, getMajorArcanaByLine, formatCardName } = require('../cardHelpers');
const { lookupCard, getMappings } = require('../cardLookup');

const mappings = getMappings();

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
    const { showMainMenu } = require('./mainMenu');
    // Reset breadcrumb when returning to main menu
    await showMainMenu(createBreadcrumb());
  } else {
    console.log('\nGoodbye!');
    process.exit(0);
  }
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
    const { showMainMenu } = require('./mainMenu');
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

  // Return to main menu when Back is pressed
  const returnToMainMenu = async () => {
    const { showMainMenu } = require('./mainMenu');
    await showMainMenu(createBreadcrumb());
  };

  await selectFromCardList(minorCards, returnToMainMenu, breadcrumb, 'Select a card:');
}

module.exports = {
  browseByCategory,
  displayCardAndPrompt,
  selectFromCardList
};
