# TarotNavigator

A CLI app for lightweight tarot card interpretations. TarotNavigator lets users familiarize themselves with subjective themes and grouped categories associated with many decks, surfacing where these overlap in a given card.

From a programming perspective, this is an exercise in rule-based mapping and cross-referenced indexing. 

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

Since this is a Major Arcana card, we know we're working with macro
energies that move us from one place to another in our lives.

As part of Line 1, this card deals with our foundational identity, our
understanding of ourselves, and how we show up in the world. Think of this
as the caterpillar line.
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
