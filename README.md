# TarotNavigator

A CLI app for lightweight tarot card interpretations. TarotNavigator lets users familiarize themselves with categories and subjective themes that persist across many tarot decks, surfacing where these categories overlap in a given card.

_Note: This is a toy app, and not intended as a means of mental heath support._ 

## Installation

Requires Node.js 12+.

```bash
git clone https://github.com/yourusername/tarotnavigator.git
cd tarotnavigator
npm install
```

## Startup

```bash
# Interactive menu
node index.js
```

## Usage

Search for a specific card:
```bash
$ node index.js
? Select an option: (Use arrow keys)
❯ Search for a Card
  ...

? Enter card name: the fool
```

Or browse by suit, card type, or category:
```bash
$ node index.js
? Select an option: (Use arrow keys)
  Search for a Card
❯ Browse by Suit
  Browse by Card Type
  Browse by Category
  ...
```
