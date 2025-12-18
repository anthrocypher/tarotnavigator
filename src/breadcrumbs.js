// Chalk for terminal colors (transitive dependency from inquirer)
const chalk = require('chalk');

// Breadcrumb management functions
function createBreadcrumb() {
  return { trail: [] };
}

function addBreadcrumbStep(breadcrumb, prompt, selection) {
  return {
    trail: [...breadcrumb.trail, { prompt, selection }]
  };
}

function formatBreadcrumb(breadcrumb) {
  if (breadcrumb.trail.length === 0) {
    return '';
  }

  const formatted = breadcrumb.trail
    .map(step => chalk.blue(step.selection))
    .join(' → ');

  return '\n' + formatted + '\n';
}

function displayBreadcrumb(breadcrumb) {
  const formatted = formatBreadcrumb(breadcrumb);
  if (formatted) {
    console.log(formatted);
  }
}

module.exports = {
  createBreadcrumb,
  addBreadcrumbStep,
  formatBreadcrumb,
  displayBreadcrumb
};
