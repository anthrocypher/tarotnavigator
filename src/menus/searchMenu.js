const inquirer = require('inquirer');
const { createBreadcrumb, addBreadcrumbStep, displayBreadcrumb } = require('../breadcrumbs');
const { searchCards, formatCardName } = require('../cardHelpers');
const { selectFromCardList, displayCardAndPrompt } = require('./categoryMenu');

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
    const { showMainMenu } = require('./mainMenu');
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
      const { showMainMenu } = require('./mainMenu');
      await showMainMenu(breadcrumb);
    }
    return;
  }

  // Truncate long search queries for breadcrumb display
  const displayQuery = searchQuery.length > 30 ? searchQuery.substring(0, 27) + '...' : searchQuery;
  const newBreadcrumb = addBreadcrumbStep(breadcrumb, 'Search:', displayQuery);

  if (results.length === 1) {
    // Single match - display immediately
    const cardKey = results[0];
    const cardBreadcrumb = addBreadcrumbStep(newBreadcrumb, 'Card:', formatCardName(cardKey));
    await displayCardAndPrompt(cardKey, cardBreadcrumb);
  } else {
    // Multiple matches - let user select
    console.log(`\nFound ${results.length} cards matching "${searchQuery}"\n`);
    await selectFromCardList(results, searchCardsMenu, newBreadcrumb, 'Select a card:');
  }
}

module.exports = {
  searchCardsMenu
};
