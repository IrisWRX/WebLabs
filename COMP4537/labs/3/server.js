const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { getDate } = require('./modules/utils');
const message = require('./locals/en/en.json');

const FILE_PATH = path.join(__dirname, 'file.txt'); 

class ApiServer {
    constructor(port = 3000) {
        this.port = port;
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
    }

    start() {
        this.server.listen(this.port)
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        if(pathname === '/COMP4537/labs/3/getDate/') {
            this.handleGetDate(query, res);
        } else if(pathname === '/COMP4537/labs/3/writeFile/') {
            this.handleWriteFile(query, res);
        } else if(pathname.startsWith('/COMP4537/labs/3/readFile/')) {
            this.handleReadFile(pathname, res);
        } else {
            this.sendResponse(res, 404, "404 Not Found")
        }
    }

    handleGetDate(query, res) {
        const name = query.name;
        const currentDate = getDate();
        let greeting = message.greeting.replace('%1', name).replace('%2', currentDate);
        this.sendResponse(res, 200, `<html><body style="color: blue;">${greeting}</body></html>`, 'text/html')
    }

    handleWriteFile(query, res) {
        if(!query.text) {
            this.sendResponse(res, 400, "Missing 'text' parameter");
            return;
        }

        fs.appendFile(FILE_PATH, query.text + '\n', (err) => {
            if(err) {
                this.sendResponse(res, 500, "Unable to write to file")
            } else {
                this.sendResponse(res, 200, "Text appended successfully")
            }
        });
    }

    handleReadFile(pathname, res) {
        const fileName = path.basename(pathname);
        const filePath = path.join(__dirname, fileName);
 
        fs.readFile(filePath, 'utf8', (err, data) => {
            if(err) {
                this.sendResponse(res, 404, `File '${fileName}' not found`)
            } else {
                this.sendResponse(res, 200, data);
            }
        })
    }

    sendResponse(res, statusCode, message, contentType = 'text/plain') {
        res.writeHead(statusCode, {'Content-Type': contentType});
        res.end(message);
    }
}

const apiServer = new ApiServer(process.env.PORT);
apiServer.start();