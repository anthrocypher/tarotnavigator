# TarotNavigator

A CLI app for lightweight tarot card interpretations. TarotNavigator lets users familiarize themselves with categories and subjective themes that persist across many tarot decks, surfacing where these categories overlap in a given card.

Note: This is a toy app, and not intended as a means of mental heath support. 

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

##Usage Examples

Look up a card directly:
```bash
$ node index.js "the fool"
```

Or browse interactively by suit, card type, or category:
```bash
$ node index.js
? What would you like to do?
  > Search for a Card
    Browse by Suit
    Browse by Card Type
    ...
```
