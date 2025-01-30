const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { getDate } = require('./modules/utils');
const message = require('./locals/en/en.json');

const FILE_PATH = path.join(__dirname, 'file.txt'); 

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); 
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if(pathname === '/COMP4537/labs/3/getDate/') {
        const name = query.name;
        const currentDate = getDate();

        let greeting = message.greeting.replace('%1', name).replace('%2', currentDate);

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`<html><body style="color: blue;">${greeting}</body></html>`)
    } else if(pathname === '/COMP4537/labs/3/writeFile/') {
        if(!query.text) {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end("Missing 'text' parameter");
            return;
        }

        fs.appendFile(FILE_PATH, query.text + '\n', (err) => {
            if(err) {
                res.writeHead(500, {'Content-Type': 'text/plain'}); 
                res.end("Unable to write to file")
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end("Text appended successfully")
            }
        })
    } else if(pathname === '/COMP4537/labs/3/readFile/file.txt') {
        fs.readFile(FILE_PATH, 'utf8', (err, data) => { 
            if(err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end(`File 'file.txt' not found`);
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(data)
            }
        })
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end("404 Not found");
    }
})

const port = process.env.PORT || 3000; 
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
