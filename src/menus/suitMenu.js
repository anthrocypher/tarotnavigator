const inquirer = require('inquirer');
const { createBreadcrumb, addBreadcrumbStep, displayBreadcrumb } = require('../breadcrumbs');
const { getCardsBySuit, getCourtCardsBySuit, getNumberedCardsBySuit } = require('../cardHelpers');
const { selectFromCardList } = require('./categoryMenu');

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
    const { showMainMenu } = require('./mainMenu');
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

module.exports = {
  browseBySuit
};
