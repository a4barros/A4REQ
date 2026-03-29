const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");
const path = require("path");


function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { _, height } = primaryDisplay.workAreaSize;

    const win = new BrowserWindow({
        width: 1200,
        height: height / 1.5,
        zoom: 2,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
        darkTheme: true,
    });
    win.loadFile("index.html");
}

// Menu.setApplicationMenu(null);

app.whenReady().then(createWindow);

ipcMain.handle("http-request", async (_, options) => {
    try {
        const res = await fetch(options.url, {
            method: options.method,
            headers: options.headers,
            body: options.body || undefined,
        });

        const text = await res.text();

        return {
            status: res.status,
            headers: Object.fromEntries(res.headers.entries()),
            body: text,
        };
    } catch (err) {
        return {
            error: err.message,
        };
    }
});