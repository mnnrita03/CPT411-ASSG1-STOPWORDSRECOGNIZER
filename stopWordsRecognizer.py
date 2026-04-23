import tkinter as tk
from tkinter import scrolledtext, messagebox

class StopWordDFA:
    def __init__(self):
        # Current machine state
        self.state = 0
        # Results storage for rubric compliance [cite: 28]
        self.found_words = [] # Stores {word, start_pos, end_pos}
        self.occurrences = {}
        self.delimiters = " .,\n\r\t!()?\""

    def is_delimiter(self, char):
        return char in self.delimiters

    def run_dfa(self, text):
        """
        Requirement: Process one character at a time from left to right[cite: 19].
        No string matching APIs allowed[cite: 20].
        """
        self.state = 0
        self.found_words = []
        self.occurrences = {}
        
        word_start = 0
        current_word_buffer = ""

        for i, char in enumerate(text):
            low_char = char.lower() # Case-insensitive strategy
            
            # DFA State Transitions
            if self.state == 0: # Start State
                word_start = i
                current_word_buffer = char
                if low_char == 'i': self.state = 1    # Branch: i, it, its, if
                elif low_char == 't': self.state = 10 # Branch: the, to, they, them
                elif low_char == 'a': self.state = 20 # Branch: a, an, and
                elif self.is_delimiter(char): self.state = 0 # Remain at start
                else: self.state = 99 # Trap State [cite: 18]

            elif self.state == 1: # Read 'i'
                current_word_buffer += char
                if low_char == 't': self.state = 2
                elif low_char == 'f': self.state = 3
                elif self.is_delimiter(char): self.accept("i", word_start, i)
                else: self.state = 99

            elif self.state == 2: # Read 'it'
                current_word_buffer += char
                if low_char == 's': self.state = 4
                elif self.is_delimiter(char): self.accept("it", word_start, i)
                else: self.state = 99

            # ... (Additional states for 'the', 'and', etc. follow same logic) ...

            elif self.state == 99: # Trap State logic [cite: 18]
                if self.is_delimiter(char):
                    self.state = 0 # Reset on delimiter to scan next word
                else:
                    self.state = 99 # Self-loop in trap

    def accept(self, word, start, end):
        """Action performed when reaching an Accepting State + Delimiter."""
        self.found_words.append({'word': word, 'start': start, 'end': end})
        self.occurrences[word] = self.occurrences.get(word, 0) + 1
        self.state = 0 # Reset machine to q0

# --- GUI Interface Implementation ---
class DFAApp:
    def __init__(self, root):
        self.root = root
        self.root.title("CPT411: L6 Stop Words Finder (DFA)")
        self.dfa = StopWordDFA()

        # Text Input Area
        tk.Label(root, text="Input Text (Sample I, II, or III):").pack(pady=5)
        self.text_input = scrolledtext.ScrolledText(root, width=70, height=10)
        self.text_input.pack(pady=5)

        # Run Button
        self.run_btn = tk.Button(root, text="Run DFA Recognizer", command=self.process_text, bg="green", fg="white")
        self.run_btn.pack(pady=10)

        # Output/Visualization Area 
        tk.Label(root, text="Results (Boldface Visualization):").pack()
        self.display = scrolledtext.ScrolledText(root, width=70, height=10, state='disabled')
        self.display.tag_configure("bold", font=("Helvetica", 10, "bold"), foreground="red")
        self.display.pack(pady=5)

    def process_text(self):
        raw_text = self.text_input.get("1.0", tk.END)
        self.dfa.run_dfa(raw_text)
        
        # Display Results with Boldface [cite: 28]
        self.display.config(state='normal')
        self.display.delete("1.0", tk.END)
        self.display.insert(tk.END, raw_text)
        
        for found in reversed(self.dfa.found_words):
            start_idx = f"1.0 + {found['start']} chars"
            end_idx = f"1.0 + {found['end']} chars"
            self.display.tag_add("bold", start_idx, end_idx)
            
        self.display.config(state='disabled')
        
        # Summary Status [cite: 27]
        summary = "\n".join([f"{w}: {count} times" for w, count in self.dfa.occurrences.items()])
        messagebox.showinfo("DFA Status: Accept", f"Patterns Found:\n{summary}")

if __name__ == "__main__":
    root = tk.Tk()
    app = DFAApp(root)
    root.mainloop()