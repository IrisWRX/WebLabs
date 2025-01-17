// Disclosure: The structure of classes and some functions (setRandomPosition(),
// generateRandomColors(), scrambleButtons()...) were developed with assistance from
// ChatGPT and Claude. They also helped solve issues such as
// managing timeout clearance during game resets.

import { MESSAGES } from "../lang/messages/en/user.js";

const GAME_CONFIG = {
  MIN_BUTTONS: 3,
  MAX_BUTTONS: 7,
  SCRAMBLE_INTERVAL: 2000,
  MEMORY_TIME_PER_BUTTON: 1000,
  MIN_CONTAINER_HEIGHT: 300,
  BUTTON_SPACING: 11,
  BUTTON_COLORS: [
    "#FF6B6B",
    "#FF99C8",
    "#45B7D1",
    "#96CEB4",
    "#FFBE0B",
    "#9B5DE5",
    "#FF006E",
  ],
};

class GameButton {
  constructor(color, order) {
    this.order = order;
    this.element = document.createElement("button");
    this.element.className = "game-button";
    this.element.textContent = order + 1;
    this.element.style.backgroundColor = color;
    this.element.style.width = "10em";
    this.element.style.height = "5em";
  }

  setLocation(top, left) {
    this.element.style.top = top;
    this.element.style.left = left;
  }

  setRandomPosition(containerWidth, containerHeight) {
    const buttonWidth = this.element.offsetWidth;
    const buttonHeight = this.element.offsetHeight;
    const maxX = Math.max(0, containerWidth - buttonWidth);
    const maxY = Math.max(0, containerHeight - buttonHeight);
    const randomX = Math.min(maxX, Math.floor(Math.random() * maxX));
    const randomY = Math.min(maxY, Math.floor(Math.random() * maxY));
    this.setLocation(randomY + "px", randomX + "px");
  }

  hideNumber() {
    this.element.classList.add("hidden-number");
  }

  showNumber() {
    this.element.classList.remove("hidden-number");
  }

  remove() {
    this.element.remove();
  }
}

class GameState {
  constructor() {
    this.buttons = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.scrambleCount = 0;
    this.totalScrambles = 0;
    this.scrambleTimer = null;
    this.startSequenceTimer = null;
  }

  reset() {
    this.currentIndex = 0;
    this.isPlaying = false;
    this.scrambleCount = 0;
    this.buttons.forEach((button) => button.remove());
    this.buttons = [];

    if (this.scrambleTimer) {
      clearTimeout(this.scrambleTimer);
      this.scrambleTimer = null;
    }
    if (this.startSequenceTimer) {
      clearTimeout(this.startSequenceTimer);
      this.startSequenceTimer = null;
    }
  }
}

class MemoryGame {
  constructor() {
    this.state = new GameState();

    document.title = MESSAGES.PAGE_TITLE;

    this.buttonArea = document.getElementById("buttonArea");
    this.messageDisplay = document.getElementById("message");
    this.startButton = document.getElementById("startButton");
    this.buttonCount = document.getElementById("buttonCount");

    document.querySelector('label[for="buttonCount"]').textContent =
      MESSAGES.PROMPT;
    this.startButton.textContent = MESSAGES.START_BUTTON;

    this.startButton.addEventListener("click", () => this.startGame());
  }

  generateRandomColors(count) {
    // Use slice() to create a copy, avoiding mutations to BUTTON_COLORS, then shuffle and take first 'count' elements
    return GAME_CONFIG.BUTTON_COLORS.slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  startGame() {
    const count = parseInt(this.buttonCount.value);

    this.state.reset();

    if (
      count < GAME_CONFIG.MIN_BUTTONS ||
      count > GAME_CONFIG.MAX_BUTTONS ||
      isNaN(count)
    ) {
      this.showMessage(MESSAGES.INVALID_INPUT);
      return;
    }

    this.messageDisplay.textContent = "";
    this.state.totalScrambles = count;
    this.createButtons(count);
    // Store timer reference to allow cleanup during reset
    this.state.startSequenceTimer = setTimeout(
      () => this.startScrambleSequence(),
      count * GAME_CONFIG.MEMORY_TIME_PER_BUTTON
    );
  }

  createButtons(count) {
    const colors = this.generateRandomColors(count);
    for (let i = 0; i < count; i++) {
      const button = new GameButton(colors[i], i);
      button.setLocation("0", i * GAME_CONFIG.BUTTON_SPACING + "em");
      this.buttonArea.appendChild(button.element);
      this.state.buttons.push(button);
    }
  }

  startScrambleSequence() {
    this.scrambleButtons();
  }

  scrambleButtons() {
    const containerWidth = this.buttonArea.offsetWidth;
    const containerHeight = Math.max(
      GAME_CONFIG.MIN_CONTAINER_HEIGHT,
      this.buttonArea.offsetHeight
    );

    this.buttonArea.style.minHeight = containerHeight + "px";

    if (this.state.scrambleCount >= this.state.totalScrambles) {
      this.startMemoryTest();
      return;
    }

    this.state.buttons.forEach((button) => {
      button.setRandomPosition(containerWidth, containerHeight);
    });

    this.state.scrambleCount++;
    // Schedule next scramble with delay until reaching total scramble count
    this.state.scrambleTimer = setTimeout(
      () => this.scrambleButtons(),
      GAME_CONFIG.SCRAMBLE_INTERVAL
    );
  }

  startMemoryTest() {
    this.state.buttons.forEach((button) => {
      button.hideNumber();
      button.element.addEventListener("click", () =>
        this.handleButtonClick(button)
      );
    });
    this.state.isPlaying = true;
  }

  handleButtonClick(button) {
    if (!this.state.isPlaying) return;

    if (button.order === this.state.currentIndex) {
      button.showNumber();
      this.state.currentIndex++;

      if (this.state.currentIndex === this.state.buttons.length) {
        this.showMessage(MESSAGES.EXCELLENT_MEMORY);
        this.state.isPlaying = false;
      }
    } else {
      this.endGame();
    }
  }

  endGame() {
    this.state.isPlaying = false;
    this.showMessage(MESSAGES.WRONG_ORDER);
    this.state.buttons.forEach((button) => button.showNumber());
  }

  showMessage(message) {
    this.messageDisplay.textContent = message;
  }
}

(() => {
  "use strict";
  new MemoryGame();
})();
