# Assignment 1: Building the ELIZA Chatbot

## Overview

In this assignment, you will build a simplified version of the ELIZA chatbot, one of the earliest programs to mimic human conversation. ELIZA was designed to simulate a session with a non-directive psychotherapist. Your goal is to implement this chatbot using the specific structure outlined below. The chatbot will follow a predefined set of rules for pattern matching and response generation, closely mirroring the original ELIZA.

## Objectives

You will implement a Python program that:
1. Reads a set of predefined rules from a file.
2. Uses these rules to:
   - Print an initial greeting at the start of the interaction.
   - Quit the interaction loop when the user inputs a designated quit word.
   - Perform various text manipulations including pre- and post-substitutions, synonym substitutions, and decomposition/reassembly of patterns.
   - Generate responses according to the defined patterns.
   - Print a final message when the conversation ends.

## Instructions

You will follow these steps to complete the assignment. Each part corresponds to specific functionality that the chatbot must have.

### 1. Read the Rules from a File
The chatbot will use a predefined file (`instructions.txt`) containing patterns, synonyms, and rules for text manipulations. You will need to write code to read and parse this file into an appropriate data structure that your program can use for:
- Greeting the user at the start and end of the conversation.
- Substituting text before and after pattern matching.
- Handling synonym substitutions.
- Matching user inputs to patterns and responding appropriately.

### 2. Start with a Greeting
Once the chatbot starts, it should display one of the pre-defined greeting lines from the `instructions.txt` file. For example:
$$$
Welcome. What brings you here today?
$$$

### 3. Implement the Conversation Loop
Your chatbot should repeatedly ask for user input and respond based on pattern matching until the user types a quit command. The conversation ends when the user enters one of the quit keywords specified in the instructions file (e.g., `bye`, `quit`).

### 4. Pre-Substitutions
Before matching patterns, the chatbot should perform **pre-substitutions**. These substitutions map certain words to alternatives that are easier for the chatbot to handle. For example:
- `dont` → `don't`
- `recollect` → `remember`

You should implement a function that performs these substitutions on the user’s input before further processing.

### 5. Synonym Handling
Your chatbot should also handle **synonym substitution**. The rules file provides sets of synonyms that the chatbot should treat as equivalent for pattern matching purposes. For example, the words "sad", "unhappy", and "depressed" are considered synonymous.

You will need to implement synonym substitution, where the input is normalized before attempting to match any patterns. For example, if a user says, "I am unhappy," the chatbot should recognize that "unhappy" is synonymous with "sad."

### 6. Pattern Matching
Your chatbot needs to match user input against a set of predefined patterns (as specified in the `instructions.txt` file). Patterns contain:
- **Decomposition rules**: These define how to break down a sentence into components.
- **Reassembly rules**: These dictate how to form a response based on the decomposed parts of the sentence.

For example, if the user says, "I feel sad," a decomposition rule might match `I feel *`, and a reassembly rule might respond with, "Why do you feel sad?"

You should:
- Match user input to the most relevant pattern.
- Decompose the input according to the matched pattern.
- Reassemble the parts into a response.

### 7. Post-Substitutions
Once the chatbot has generated a response, it should perform **post-substitutions** to finalize the output. This step swaps certain words to ensure grammatical correctness. For example:
- `i` → `you`
- `your` → `my`

For instance, if the user says, "I feel sad," and the chatbot's response is based on a pattern that reflects the user’s words back, the chatbot might generate, "Why do you feel sad?" It will then substitute "I" with "you" to respond with, "Why do you feel sad?"

### 8. Generate Responses and Continue the Loop
Once the chatbot generates a response, it should display the response and continue the conversation until the user types a quit command. The chatbot should have default responses if no patterns match the user input, such as:
$$$
I'm not sure I understand you fully. Can you elaborate?
$$$

### 9. Quit and Final Message
When the user inputs one of the quit keywords (e.g., `bye` or `quit`), the chatbot should print a final message, like:
$$$
That will be $200. See you again next week.
$$$

### Example Conversation

Your chatbot should handle a conversation like the following:

$$$
Chatbot: Welcome. What brings you here today?
User: I am feeling sad.
Chatbot: Why do you feel sad?
User: I can't stop thinking about my family.
Chatbot: Tell me more about your family.
User: I have to go now.
Chatbot: That will be $200. See you again next week.
$$$

## Requirements

- **Initial and final messages**: These must be drawn from the predefined options in [`instructions.txt`](instructions.txt).
- **Pre-substitutions, synonym handling, and post-substitutions**: Must be implemented according to the rules in [`instructions.txt`](instructions.txt).
- **Pattern matching**: Must use the decomposition and reassembly rules from [`instructions.txt`](instructions.txt) to generate responses.
- **Conversation loop**: The chatbot must continue the conversation until the user types a quit word.
  
## Submission

Submit a **single Jupyter notebook** that:
1. Contains your full Python implementation of the ELIZA chatbot.
2. Is formatted and runnable in **Google Colaboratory**.
3. Includes **markdown cells** explaining how you approached each part of the problem (e.g., how you implemented pre-substitutions, pattern matching, synonym handling, etc.).
4. Demonstrates example conversation logs showing how your chatbot handles different types of input.

Ensure that your notebook is well-organized, with explanations that make your code easy to follow. The notebook should run without errors when opened in Google Colaboratory.

Good luck!
