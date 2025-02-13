// Code structure has been organized with assistance from ChatGPT 4o.
import { messages } from "../lang/messages/en/user.js";

class SQLClient {
    constructor() {
        this.insertButton = document.getElementById("insertButton");
        this.submitQueryButton = document.getElementById("submitQueryButton");
        this.queryInput = document.getElementById("queryInput");
        this.errorMessage = document.getElementById("errorMessage");
        this.resultDisplay = document.getElementById("resultDisplay");
        this.addEventListeners();
    }

    addEventListeners() {
        this.insertButton.addEventListener("click", () => {
            this.queryInput.value = "";
            this.insertSampleData();
        });
        this.submitQueryButton.addEventListener("click", () => {
            this.resultDisplay.textContent = "";
            this.runQuery();
        });
        this.queryInput.addEventListener("focus", () => {
            this.errorMessage.textContent = "";
            this.resultDisplay.textContent = "";
        })
    }

    insertSampleData() {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://lab5.echo-wang.me/api/v1/insertDefaultPatients", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => { 
            if(xhr.readyState === 4) { 
                this.resultDisplay.textContent = xhr.status === 200 ? JSON.stringify(JSON.parse(xhr.responseText), null, 2) : 
                messages.responseError;
            }
        };
        xhr.send(); 
    }

    runQuery() {
        const query = this.queryInput.value.trim();

        if(!query) {
            this.errorMessage.textContent = messages.errorEmptyQuery;
            return;
        }
        if(!/^SELECT|INSERT/i.test(query)) { 
            this.errorMessage.textContent = messages.errorInvalidQuery;
            return;
        }

        const xhr = new XMLHttpRequest();
        const method = query.toUpperCase().startsWith("SELECT") ? "GET" : "POST";
        const url = method === "GET" ? `https://lab5.echo-wang.me/api/v1/sql/${encodeURIComponent(query)}` : "https://lab5.echo-wang.me/api/v1/sql";
        
        xhr.open(method, url, true);

        if(method === "POST") {
            xhr.setRequestHeader("Content-Type", "application/json");
        }

        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4) {
                this.resultDisplay.textContent = xhr.status === 200 ? JSON.stringify(JSON.parse(xhr.responseText), null, 2) : messages.responseError; 
            }
        };
        
        xhr.send(method === "POST" ? JSON.stringify({ query }) : null);
    }
}

document.addEventListener("DOMContentLoaded", () => new SQLClient());