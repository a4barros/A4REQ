import { escapeAttr } from "./util.js";

export class PageElement {
    constructor(paramsContainer, headersContainer, bodyEl) {
        this.paramsContainer = paramsContainer;
        this.headersContainer = headersContainer;
        this.bodyEl = bodyEl;
    }

    addParamRow(key = "", value = "") {
        const row = document.createElement("div");
        row.className = "param-row params";
        row.innerHTML = `
        <input type="text" class="param-key" placeholder="name" value="${escapeAttr(key)}" aria-label="Query parameter name" />
        <input type="text" class="param-value" placeholder="value" value="${escapeAttr(value)}" aria-label="Query parameter value" />
        <button type="button" class="btn-icon remove-param" title="Remove" aria-label="Remove parameter">&times;</button>
    `;
        row.querySelector(".remove-param").addEventListener("click", () => row.remove());
        this.paramsContainer.appendChild(row);
    }

    clearParamRows() {
        const rows = document.getElementsByClassName("params");
        while (rows.length > 0) {
            rows[0].remove();
        }
    }

    addHeaderRow(name = "", value = "") {
        const row = document.createElement("div");
        row.className = "param-row headers";
        row.innerHTML = `
        <input type="text" class="header-name" placeholder="Name" value="${escapeAttr(name)}" aria-label="Header name" />
        <input type="text" class="header-value" placeholder="Value" value="${escapeAttr(value)}" aria-label="Header value" />
        <button type="button" class="btn-icon remove-header" title="Remove" aria-label="Remove header">&times;</button>
    `;
        row.querySelector(".remove-header").addEventListener("click", () => row.remove());
        this.headersContainer.appendChild(row);
    }

    clearHeaderRows() {
        const rows = document.getElementsByClassName("headers");
        while (rows.length > 0) {
            rows[0].remove();
        }
    }

    updateBodyState() {
        this.bodyEl.disabled = !METHODS_WITH_BODY.has(methodEl.value);
    }
}