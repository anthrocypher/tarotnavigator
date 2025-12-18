const inquirer = require('inquirer');
const { createBreadcrumb, addBreadcrumbStep, displayBreadcrumb } = require('../breadcrumbs');
const { getAllMajorArcana, getCourtCards, getNumberedCards, filterCardsBySuit } = require('../cardHelpers');
const { selectFromCardList } = require('./categoryMenu');

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
    const { showMainMenu } = require('./mainMenu');
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

module.exports = {
  browseByType
};
