# 🗝️ Treasure Vault - Kaplay Game (Chat-Controlled)

A retro dungeon adventure web game built using the **KAPLAY.js** (formerly Kaboom.js) 2D game engine.
Instead of manual keypad controls, the player is navigated via a **conversational chat interface**!

---

## 📖 Game Overview & Rules

You are directing a brave explorer in an ancient dungeon vault. Inside the chamber are **four numbered treasure chests**:
- **Objective:** Find the chest containing the **Gold** to win!
- **Danger:** Three of the chests contain venomous **Snakes**!
- **Health:** You have **2 Hearts** ❤️ ❤️.
  - If a chest opens with a snake, your explorer gets bitten and loses 1 heart.
  - If your explorer loses both hearts (0 hearts remaining), it's **Game Over**! 💀
  - If your explorer finds the Gold before losing all hearts, **You Win**! 🏆

---

## 💬 How to Control the Explorer (Chat Commands)

At the bottom of the screen is the **Adventurer Chat Console**. Type instructions into the chat bar and hit **Send** (or press `Enter`):

1. **Move to a Specific Chest:**
   - Type `"chest number 1"` to move the player to Chest #1.
   - Type `"chest number 2"` to move the player to Chest #2.
   - Type `"chest number 3"` to move the player to Chest #3.
   - Type `"chest number 4"` to move the player to Chest #4.
   *(Natural shortcuts like `"chest 1"`, `"go to chest 2"`, or clicking the **Quick Command** buttons are also supported).*

2. **Player Movement & Feedback:**
   - Once commanded, your adventurer talks back in the chat (`"On my way to Chest #1! 🚶‍♂️"`).
   - The character animates and walks directly to that chest.
   - Upon arrival, the chest pops open and reveals what is inside:
     - 🐍 **Snake:** Screen shakes, damage sound plays, heart drops by 1, and the adventurer reports the attack in the chat.
     - 🏆 **Gold:** Sparkles burst, victory fanfare plays, and victory is declared in the chat and on screen!

3. **Restarting the Game:**
   - Type `"restart"`, `"new game"`, or click the **New Game** / **Play Again** buttons.

---

## 🚀 How to Run the Game

### Method 1: Direct File Launch (No server required!)
Double-click `index.html` or open it directly in any browser (Chrome, Edge, Firefox, Safari).
The game includes a local copy of `kaplay.js`, inline SVG assets, and procedural Web Audio synthesis, so it runs completely self-contained and offline!

### Method 2: Local Web Server
```powershell
cd "C:\Users\diego\.gemini\antigravity\scratch\kaplay-treasure-game"
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🛠️ Project Structure

- `index.html` — HTML application layout, HUD, health meter, and the Adventurer Chat interface.
- `style.css` — Dungeon aesthetic styling, responsive layout, chat bubble themes, and modal cards.
- `game.js` — Kaplay game engine, chat command parser, path navigation, audio synthesizer, and particle effects.
- `kaplay.js` — Standalone offline copy of Kaplay library.
- `test_game.js` — Automated unit test suite verifying chat command parsing, navigation vectors, and win/loss logic.
