# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TarotNavigator is a simple Node.js CLI tool that provides string-to-string mappings. It's a command-line utility built with the Commander.js library that reads input and returns corresponding mapped values from a JSON data file.

## Architecture

- **index.js**: Main entry point and CLI handler using Commander.js
- **data.json**: Contains the mapping data structure (key-value pairs where values are arrays of strings)
- **package.json**: Defines the CLI binary as "mapper" pointing to index.js

## Usage

The tool is designed to be used as a CLI command:
```bash
node index.js <input>
# or if installed globally:
mapper <input>
```

## Core Functionality

The application:
1. Loads mappings from data.json into memory on startup
2. Takes a single string argument as input
3. Looks up the input in the mappings object
4. Returns all mapped values (one per line) or a "No mapping found" message

## Data Structure

The data.json file contains a simple object where:
- Keys are the input strings to match
- Values are arrays of strings that represent the mapped outputs

## Development Notes

- This is a simple, single-file CLI application with minimal dependencies
- No build process, linting, or testing framework is currently configured
- The application runs directly with Node.js without compilation
- All logic is contained in index.js with data externalized to data.json