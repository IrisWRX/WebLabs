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
        this.insertButton.addEventListener("click", () => this.insertSampleData());
        this.submitQueryButton.addEventListener("click", () => this.runQuery());
    }

    insertSampleData() {
        this.errorMessage.textContent = "";
        this.resultDisplay.textContent = "";

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://lab5.echo-wang.me/api/v1/insertDefaultPatients", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = () => { 
            if(xhr.readyState === 4) { 
                const response = JSON.parse(xhr.responseText);
                const affectedRows = response.data.affectedRows;
                this.resultDisplay.textContent = messages.insertSuccess(affectedRows);
            }
        };
        xhr.send(); 
    }

    runQuery() {
        this.errorMessage.textContent = "";
        this.resultDisplay.textContent = "";
        
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
                const response = JSON.parse(xhr.responseText);
        
                if (response.error) {
                    this.resultDisplay.textContent = response.error;
                } else if (Array.isArray(response.data)) {
                    const table = document.createElement('table');
                    table.style.borderCollapse = 'collapse';
                    table.style.width = '100%';
                    
                    if (response.data.length > 0) {
                        const thead = document.createElement('thead');
                        const headerRow = document.createElement('tr');
                        Object.keys(response.data[0]).forEach(key => {
                            const th = document.createElement('th');
                            th.textContent = key;
                            th.style.border = '1px solid #ddd';
                            th.style.padding = '8px';
                            th.style.backgroundColor = '#f4f4f4';
                            headerRow.appendChild(th);
                        });
                        thead.appendChild(headerRow);
                        table.appendChild(thead);
                    }
                    
                    const tbody = document.createElement('tbody');
                    response.data.forEach(row => {
                        const tr = document.createElement('tr');
                        Object.values(row).forEach(value => {
                            const td = document.createElement('td');
                            td.textContent = value;
                            td.style.border = '1px solid #ddd';
                            td.style.padding = '8px';
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    
                    this.resultDisplay.textContent = '';
                    this.resultDisplay.appendChild(table);
                } else {
                    const affectedRows = response.data.affectedRows;
                    this.resultDisplay.textContent = messages.insertSuccess(affectedRows);
                }
            }
        };
        
        xhr.send(method === "POST" ? JSON.stringify({ query }) : null);
    }
}

document.addEventListener("DOMContentLoaded", () => new SQLClient());