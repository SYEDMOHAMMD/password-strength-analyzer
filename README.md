# Password Strength Analyzer

A browser-based tool that evaluates password strength in real time using entropy estimation, common security rules, and basic attack modeling. Built to demonstrate core concepts in password security and frontend logic.

---

## Overview

This project analyzes a user's password as they type and provides immediate feedback on its strength. It combines rule-based checks (length, character diversity) with entropy calculation to estimate how resistant a password is to brute-force and dictionary attacks.

An optional Claude AI integration generates high-level suggestions for improving weak passwords.

---

## Features

- Real-time password strength evaluation
- Entropy-based strength calculation (in bits)
- Estimated time-to-crack using brute-force assumptions
- Detection of common weak passwords (blacklist check)
- Character diversity analysis (lowercase, uppercase, numbers, symbols)
- AI-generated improvement suggestions (via Claude API)
- Minimal, responsive UI

---

## Key Learning Concepts

- Password entropy calculation: `log2(character set size) × length`
- Brute-force vs dictionary attack models
- NIST-style password guidelines (length over complexity)
- Regex-based pattern detection
- Frontend event handling and live feedback systems
- API integration (Anthropic Claude)

---

## Important Note

This tool is designed for **educational purposes only**.  
It does not guarantee real-world password security and should not be used as a sole measure for protecting sensitive accounts.

---

## How to Run

1. Download or clone the repository  
2. Open `password_checker.html` in any modern browser  
3. Start typing a password to see live analysis  

> Note: AI suggestions require a valid Anthropic API key.

---

## Tech Stack

- HTML5  
- CSS3  
- Vanilla JavaScript  
- Claude AI (Anthropic Messages API)

---

## Author

**Mohammad Qaim  
2nd Year Computer Science Student  
Interest: Cybersecurity, Secure Systems  
Location: Islamabad, Pakistan  

---

## License

This project is for educational purposes only.
