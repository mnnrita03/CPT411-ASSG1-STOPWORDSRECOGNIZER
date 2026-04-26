# CPT411 Assignment 1: Stop Words Recognizer

A Deterministic Finite Automaton (DFA) implementation that recognizes and identifies common English stop words in text using formal language processing techniques.

## Contributors

| Name | Metric Number |
|------|---------------|
| [MIZAN QISTINA BINTI NORUDEN] | [160355] |
| NORITA BINTI MUIN | 160453 |
| [Student Name 3] | [Metric Number 3] |


## Overview

This project implements a DFA-based stop word recognizer for CPT411 (Formal Languages and Automata Theory). The application identifies common English stop words (articles, pronouns, conjunctions, prepositions, and verbs) in input text and provides detailed analysis including:

- **Word categorization** by linguistic type
- **DFA state trace** visualization showing the computation path
- **Position tracking** of matched stop words
- **Frequency analysis** with visual representations
- **Interactive UI** with multiple analysis tabs

## Features

### Stop Word Recognition
The recognizer identifies 27 common English stop words organized into 5 categories:

- **Articles**: a, an, the
- **Pronouns**: i, it, he, she, we, they, me, us, them, my, its
- **Conjunctions**: and, or, but, so, if, as
- **Prepositions**: in, on, at, to, of, by
- **Verbs**: is, are, was, were

### Analysis Capabilities

1. **Annotated Output**: Input text with matched stop words highlighted by category
2. **DFA Trace**: Step-by-step visualization of state transitions for each token
3. **Position Table**: Comprehensive table showing token position, index, category, and final state
4. **Occurrence Analysis**: Frequency distribution of matched stop words with visual bars
5. **Statistics**: Total tokens, total matches, unique stop words, and match percentage

## Technical Details

### DFA Implementation

The recognizer uses a hardcoded transition table (`DELTA`) with:
- **Start state**: q0
- **Accept states**: q1, q3, q4, q5, q6, q7, q10, q11, q12, q14, q15, q19, q21, q23, q25, q27, q28, q29, q30, q31
- **Trap states**: q32-q37 (reject states)

### Character-by-Character Processing

The implementation uses strict character-level operations with NO string methods like `split()`, `replace()`, or `match()` to ensure compliance with formal language theory constraints:

- Character access via `charCodeAt()` and `charAt()`
- Manual case folding via `lowerCharCode()`
- Boundary detection for word acceptance (state + lexicon check)

## Usage

### Running the Application

1. Open `index.html` in a web browser
2. Enter text in the input field
3. Click "Run DFA" to analyze the text
4. View results across multiple tabs:
   - **Annotated**: Color-coded stop words in context
   - **Trace**: DFA state transitions for each word
   - **Positions**: Detailed position and state information
   - **Occurrences**: Frequency analysis and statistics


## How the DFA Works

1. **Tokenization**: Input text is split into words and non-word characters (no split() method)
2. **Normalization**: Each character is converted to lowercase for processing
3. **State Transitions**: For each character, the DFA transitions using the lookup table
4. **Acceptance Decision**: A word is accepted if:
   - The final state is in ACCEPT_STATES, AND
   - The normalized word exists in the STOP_SET lexicon
5. **Results**: Categorized, positioned, and counted matches are displayed


## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Styling and color categorization
- **Vanilla JavaScript**: DFA implementation with strict character-level processing
- **JFLAP**: Formal automaton design and visualization

## Educational Value

This project demonstrates:
- DFA design and implementation
- Formal language theory applications
- Lexical analysis fundamentals
- Interactive educational software development
- Character-by-character string processing


---

**Created for**: CPT411 - Formal Languages and Automata Theory  
**Assignment**: CPT411 Assignment 1 - Stop Words Recognizer  
**Language**: HTML5, CSS3, Vanilla JavaScript

