// server.js was developed with assistance from Claude and chatGPT 

import { messages } from "../lang/messages/en/user.js";

class DictionaryClient {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    isValidWord(word) {
        return /^[a-zA-Z]+$/.test(word); 
    }

    storeDefinition(word, definition) {
        if(!this.isValidWord(word)) {
            document.getElementById("storeError").innerText = messages.nonAlphaWord;
            document.getElementById("response").innerText = "";
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${this.apiUrl}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            if(xhr.status === 200 || xhr.status === 400) {
                const response = JSON.parse(xhr.responseText);

                let message = "";
                if(response.type === "success") {
                    message = messages.newEntry(response.word, response.definition, response.wordCount);
                } else {
                    message = messages.wordExists(word);
                }

                document.getElementById("response").innerText = messages.requestPrefix(response.requestCount) + message;
                document.getElementById("storeError").innerText = "";
            } else {
                document.getElementById("storeError").innerText = messages.networkError;
                document.getElementById("response").innerText = "";
            }
        }
        xhr.send(JSON.stringify({word, definition}));
    }

    searchDefinition(word) {
        if(!this.isValidWord(word)) {
            document.getElementById("searchError").innerText = messages.nonAlphaWord;
            document.getElementById("response").innerText = "";
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${this.apiUrl}?word=${word}`, true);
        xhr.onload = function() {
            if(xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                
                let message = "";
                if(response.definition) {
                    message = messages.requestPrefix(response.requestCount) + 
                    `${response.definition.word}: ${response.definition.definition}`;
                } else {
                    message = messages.requestPrefix(response.requestCount) + 
                    messages.wordNotFound(word);
                }

                document.getElementById("result").innerText = message;
                document.getElementById("searchError").innerText = "";
            } else {
                document.getElementById("searchError").innerText = messages.networkError;
                document.getElementById("response").innerText = "";
            }
        }
        xhr.send();
    }
}

const apiUrl = "https://api.echo-wang.me/api/definitions";
const dictionaryClient = new DictionaryClient(apiUrl);
const storeForm = document.getElementById("storeForm");
const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("word");
const definitionInput = document.getElementById("definition");
const searchInput = document.getElementById("searchWord");

if(storeForm) {
    storeForm.addEventListener("submit", (event) => {
        event.preventDefault(); 
    
        const word = document.getElementById("word").value.trim();
        const definition = document.getElementById("definition").value.trim();
    
        if(!word || !definition) {
            document.getElementById("storeError").innerText = messages.emptyFields;
            return;
        }
    
        dictionaryClient.storeDefinition(word, definition);
    })
}

if(searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
    
        const word = document.getElementById("searchWord").value.trim();
    
        if(!word) {
            document.getElementById("searchError").innerText = messages.emptySearch;
            return;
        }
    
        dictionaryClient.searchDefinition(word);
    })
}

if(wordInput) wordInput.addEventListener("focus", () => document.getElementById("storeError").innerText = "");

if(definitionInput) definitionInput.addEventListener("focus", () => document.getElementById("storeError").innerText = "");

if(searchInput) searchInput.addEventListener("focus", () => document.getElementById("searchError").innerText = "");