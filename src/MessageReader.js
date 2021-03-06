import {WordTokenizer} from 'natural';
import * as config from './config';

export const MessageReader = {

  read({text, trigger_word}) {
		// Parse out the trigger word:
    if (trigger_word) {
      const replacer = new RegExp(trigger_word, '');
      text = text.replace(replacer, '');
    }
    return MessageReader.parse(text);
  },

  parse(text) {
		// Invalid request:
    if (!text) {
      return '';
    }

    text = text.trim().toLowerCase();

		// Exact match cases:
    if (text === 'poke') {
      return {command: 'poke'};
    }
    if (text === 'help') {
      return {command: 'help'};
    }
    if (text === 'new game') {
      return {command: 'newgame'};
    }
    if (text === 'end game') {
      return {command: 'endgame'};
    }
    if (text === 'leaderboard') {
      return {command: 'leaderboard'};
    }
    if (text === 'scores') {
      return {command: 'scores'};
    }

    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(text);
		// Need at least three tokens:
    if (tokens.length >= 3) {
			// Check for selecting a category:
      const tks = tokens.slice(-2);
      const value = parseInt(tks[1], 10);
      if (tks[0] === 'for' && config.VALUES.includes(value)) {
        let catTokens;

				// SPECIAL CASE: same category:
        if (tokens[0] === 'same' && tokens[1] === 'category' && tokens.length === 4) {
          catTokens = ['--same--'];
        } else {
					// This is a category selection:
          catTokens = tokens.slice(0, tokens.length - 2);

					// Special cases for leading phrases we allow:
          if (catTokens[0] === 'i' && catTokens[1] === 'll' && catTokens[2] === 'take') {
            catTokens = catTokens.slice(3);
          } else if (catTokens[0] === 'ill' && catTokens[1] === 'take') {
            catTokens = catTokens.slice(2);
          } else if (catTokens[0] === 'give' && catTokens[1] === 'me') {
            catTokens = catTokens.slice(2);
          } else if (catTokens[0] === 'choose') {
            catTokens = catTokens.slice(1);
          }
        }

				// Return the command:
        return {
          command: 'category',
          category: catTokens.join(' '),
          value
        };
      }

      const questions = ['what', 'whats', 'where', 'wheres', 'who', 'whos'];

      // This is a guess:
      if (questions.includes(tokens[0])) {
				// Dump the question:
        tokens.shift();

        const questionElements = ['is', 'are', 'was', 'were', 'the', 'a', 'an'];
				// Remove question elements for two deep:
        for (let i = 0; i < 2; i++) {
          if (questionElements.includes(tokens[0])) {
            tokens.shift();
          } else {
            break;
          }
        }

        return {
          command: 'guess',
          guess: tokens.join(' ')
        };
      }
    }
  }

};
