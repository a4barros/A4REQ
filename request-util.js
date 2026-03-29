import { normalizeUrlInput } from "./util.js";


export function collectRequestHeaders() {
    const headersContainer = document.getElementById("headers");
    const headers = {};
    headersContainer.querySelectorAll(".param-row").forEach((row) => {
        const name = row.querySelector(".header-name").value.trim();
        const value = row.querySelector(".header-value").value;
        if (name) headers[name] = value;
    });
    return headers;
}

export function buildRequestUrl() {
    const paramsContainer = document.getElementById("params");
    const urlEl = document.getElementById("url")
    const base = normalizeUrlInput(urlEl);
    if (!base) return null;
    const u = new URL(base);
    paramsContainer.querySelectorAll(".param-row").forEach((row) => {
        const key = row.querySelector(".param-key").value.trim();
        const value = row.querySelector(".param-value").value;
        if (key) u.searchParams.append(key, value);
    });
    return u.toString();
}