---
name: project-setup
description: Use this skill when the user wants to create a new project, set up a new repository, or scaffold a new codebase. This includes when they say things like "create a new project", "set up a new app", or "initialize a new repository".
---

# Project Setup Skill

This skill helps set up new projects with a standard structure and configuration.

## What to do when this skill is invoked:

1. **Ask the user for project details:**
   - Project name
   - Project type (Node.js, Python, web app, etc.)
   - Whether they want git initialized
   - Any specific dependencies or frameworks they want included

2. **Create the project directory:**
   - Create a folder with the project name
   - Navigate into that directory

3. **Initialize version control (if requested):**
   - Run `git init`
   - Create a standard .gitignore file appropriate for the project type
   - Create an initial commit with message "Initial commit"

4. **Create standard project files:**
   - README.md with project name and basic structure
   - LICENSE file (ask user which license, default to MIT)
   - .gitignore (appropriate for project type)

5. **Initialize the project (based on type):**
   - For Node.js: Run `npm init -y` and install any requested packages
   - For Python: Create requirements.txt and/or setup.py
   - For other types: Create appropriate configuration files

6. **Create a basic folder structure:**
   - src/ (for source code)
   - tests/ (for test files)
   - docs/ (for documentation)
   - Any other folders relevant to the project type

7. **Confirm with the user:**
   - Show what was created
   - Ask if they want any additional setup

## Example README.md template:

```markdown
# [Project Name]

## Description

[Brief description of what this project does]

## Installation

[Installation instructions]

## Usage

[Usage instructions]

## License

[License type]
```

## Common .gitignore patterns:

### Node.js
```
node_modules/
npm-debug.log
.env
dist/
build/
```

### Python
```
__pycache__/
*.py[cod]
venv/
.env
*.egg-info/
```

## Notes:
- Always ask before creating files
- Be respectful of existing files - don't overwrite without permission
- Tailor the structure to the specific project type
