const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

window.__API_BASE__ = window.__API_BASE__ || (isLocalHost ? "/api" : "https://hackreg-ohio-func-2041.azurewebsites.net/api");
