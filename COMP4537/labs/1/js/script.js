// Disclosure: script.js was developed with assistance from Claude AI (Anthropic).

import { messages } from "../lang/messages/en/user.js";

function initializePageText() {
  // All pages have these elements
  const pageTitle = document.getElementById("page-title");
  const mainTitle = document.getElementById("main-title");

  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname.endsWith("/")
  ) {
    // For index.html
    pageTitle.textContent = messages.TITLE;
    mainTitle.textContent = messages.TITLE;
    document.getElementById("student-name").textContent = messages.STUDENT_NAME;
    document.getElementById("writer-link").textContent = messages.WRITER;
    document.getElementById("reader-link").textContent = messages.READER;
  } else {
    // For writer.html and reader.html
    const isWriter = window.location.pathname.includes("writer.html");
    const titleText = isWriter ? messages.NOTE_WRITER : messages.NOTE_READER;
    pageTitle.textContent = titleText;
    mainTitle.textContent = titleText;
    const backLink = document.getElementById("back-link");
    if (backLink) {
      backLink.textContent = messages.BACK_TO_INDEX;
    }

    // Specific to writer.html
    const addNoteBtn = document.getElementById("add-note");
    if (addNoteBtn) {
      addNoteBtn.textContent = messages.ADD_NOTE;
    }
  }
}

class Note {
  constructor(id, content = "") {
    this.id = id;
    this.content = content;
    this.textarea = null;
    this.removeButton = null;
    this.onRemoveCallback = null;
    this.onContentChangeCallback = null;
  }

  // Creates DOM elements for the note, with different behavior for writer/reader
  createDOM(container, isReadOnly = false) {
    this.textarea = document.createElement("textarea");
    this.textarea.className = "note-textarea";
    this.textarea.value = this.content;
    this.textarea.readOnly = isReadOnly;

    if (!isReadOnly) {
      this.textarea.addEventListener("input", () => this.update());
    }

    const wrapper = document.createElement("div");
    wrapper.className = "note-wrapper";
    wrapper.appendChild(this.textarea);

    if (!isReadOnly) {
      this.removeButton = document.createElement("button");
      this.removeButton.className = "btn remove-btn";
      this.removeButton.textContent = messages.REMOVE_NOTE;
      this.removeButton.addEventListener("click", () => this.remove());
      wrapper.appendChild(this.removeButton);
    }

    container.appendChild(wrapper);
    return this;
  }

  update() {
    this.content = this.textarea.value;
    if (this.onContentChangeCallback) {
      this.onContentChangeCallback(this.id, this.content);
    }
  }

  setOnContentChangeCallback(callback) {
    this.onContentChangeCallback = callback;
  }

  remove() {
    if (this.textarea && this.textarea.parentElement) {
      this.textarea.parentElement.remove();
    }
    if (this.onRemoveCallback) {
      this.onRemoveCallback(this.id);
    }
  }

  setOnRemoveCallback(callback) {
    this.onRemoveCallback = callback;
  }

  getContent() {
    return {
      id: this.id,
      content: this.content,
    };
  }
}

// Manages notes collection and localStorage interactions
class NotesManager {
  constructor() {
    this.notes = new Map();
    this.storageKey = "notes";
    this.lastUpdateTime = null;
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.lastUpdateTime = data.timestamp;
        this.notes.clear();
        data.notes.forEach((noteData) => {
          const note = new Note(noteData.id, noteData.content);
          this.notes.set(noteData.id, note);
        });
      }
    } catch (error) {
      console.error(messages.ERROR_STORAGE, error);
    }
  }

  saveToStorage() {
    try {
      const notesData = Array.from(this.notes.values()).map((note) =>
        note.getContent()
      );
      const data = {
        timestamp: new Date().toLocaleTimeString(),
        notes: notesData,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.lastUpdateTime = data.timestamp;
      return this.lastUpdateTime;
    } catch (error) {
      console.error(messages.ERROR_STORAGE, error);
    }
  }

  updateNote(id, content) {
    const note = this.notes.get(id);
    if (note) {
      note.content = content;
      return this.saveToStorage();
    }
  }

  addNote() {
    const id = Date.now().toString();
    const note = new Note(id);
    this.notes.set(id, note);
    this.saveToStorage();
    return note;
  }

  removeNote(id) {
    this.notes.delete(id);
    this.saveToStorage();
  }

  getNotes() {
    return Array.from(this.notes.values());
  }
}

function initializeWriter() {
  const manager = new NotesManager();
  const container = document.getElementById("notes-container");
  const addButton = document.getElementById("add-note");
  const timestampEl = document.getElementById("timestamp");

  function updateTimestamp(timestamp) {
    if (timestamp) {
      timestampEl.textContent = `${messages.SAVED_AT} ${timestamp}`;
    }
  }

  // Load existing notes
  manager.loadFromStorage();
  manager.getNotes().forEach((note) => {
    note.setOnRemoveCallback((id) => {
      manager.removeNote(id);
      updateTimestamp(manager.lastUpdateTime);
    });
    note.setOnContentChangeCallback((id, content) => {
      const timestamp = manager.updateNote(id, content);
      updateTimestamp(timestamp);
    });
    note.createDOM(container);
  });

  // Add new note
  addButton.addEventListener("click", () => {
    const note = manager.addNote();
    note.setOnRemoveCallback((id) => {
      manager.removeNote(id);
      updateTimestamp(manager.lastUpdateTime);
    });
    note.setOnContentChangeCallback((id, content) => {
      const timestamp = manager.updateNote(id, content);
      updateTimestamp(timestamp);
    });
    note.createDOM(container);
    updateTimestamp(manager.lastUpdateTime);
  });

  // Auto save every 2 seconds
  setInterval(() => {
    const timestamp = manager.saveToStorage();
    updateTimestamp(timestamp);
  }, 2000);
}

function initializeReader() {
  const manager = new NotesManager();
  const container = document.getElementById("notes-container");
  const timestampEl = document.getElementById("timestamp");

  function updateDisplay() {
    manager.loadFromStorage();
    container.innerHTML = "";
    manager.getNotes().forEach((note) => {
      note.createDOM(container, true);
    });
    const currentTime = new Date().toLocaleTimeString();
    timestampEl.textContent = `${messages.UPDATED_AT} ${currentTime}`;
  }

  updateDisplay();
  setInterval(updateDisplay, 2000);
}

// Wait for DOM to be fully loaded, then initialize page text
document.addEventListener("DOMContentLoaded", () => {
  initializePageText();
  const isWriter = window.location.pathname.includes("writer.html");
  if (isWriter) {
    initializeWriter();
  } else {
    initializeReader();
  }
});
