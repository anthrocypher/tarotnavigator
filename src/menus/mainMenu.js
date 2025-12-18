const inquirer = require('inquirer');
const { createBreadcrumb, addBreadcrumbStep, displayBreadcrumb } = require('../breadcrumbs');

// Main menu
async function showMainMenu(breadcrumb = createBreadcrumb()) {
  console.log('\n' + '='.repeat(50));
  console.log('TAROT NAVIGATOR - Main Menu');
  console.log('='.repeat(50) + '\n');

  // Display breadcrumb trail
  displayBreadcrumb(breadcrumb);

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
        new inquirer.Separator(),
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  // Import menu functions here to avoid circular dependencies
  const { browseByCategory } = require('./categoryMenu');
  const { browseBySuit } = require('./suitMenu');
  const { browseByType } = require('./typeMenu');
  const { searchCardsMenu } = require('./searchMenu');

  switch (choice) {
    case 'category':
      const categoryBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Browse by Category (Major/Minor Arcana)');
      await browseByCategory(categoryBreadcrumb);
      break;
    case 'suit':
      const suitBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Browse by Suit');
      await browseBySuit(suitBreadcrumb);
      break;
    case 'type':
      const typeBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Browse by Type (Court/Numbered/Major)');
      await browseByType(typeBreadcrumb);
      break;
    case 'search':
      const searchBreadcrumb = addBreadcrumbStep(breadcrumb, 'Select an option:', 'Search for a Card');
      await searchCardsMenu(searchBreadcrumb);
      break;
    case 'exit':
      console.log('\nGoodbye!');
      process.exit(0);
      break;
  }
}

module.exports = {
  showMainMenu
};
