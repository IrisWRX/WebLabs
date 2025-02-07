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
        xhr.open("POST", `${this.apiUrl}/definitions`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            if(xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                document.getElementById("response").innerText = `Request #${response.requestCount}: ${response.message}\nTotal entries: ${response.totalEntries}`;
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
        xhr.open("GET", `${this.apiUrl}/definitions?word=${word}`, true);
        xhr.onload = function() {
            if(xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const result = document.getElementById("result");
                if(response.definition) {
                    result.innerText = `Request #${response.requestCount}: Definition of "${word}" is "${response.definition}"`;
                } else {
                    result.innerText = `Request #${response.requestCount}: ${messages.notFound} "${word}"`;
                }
                document.getElementById("searchError").innerText = "";
            } else {
                document.getElementById("searchError").innerText = messages.networkError;
                document.getElementById("response").innerText = "";
            }
        }
        xhr.send();
    }
}

const apiUrl = "";
const dictionaryClient = new DictionaryClient(apiUrl);

const storeForm = document.getElementById("storeForm");
const searchForm = document.getElementById("searchForm");

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