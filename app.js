import { PageElement } from "./page-elements.js"
import { buildRequestUrl, collectRequestHeaders } from "./request-util.js"

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const methodEl = document.getElementById("method");
const addParamBtn = document.getElementById("add-param");
const addHeaderBtn = document.getElementById("add-header");
const bodyEl = document.getElementById("body");
const sendBtn = document.getElementById("send");
const statusEl = document.getElementById("status");
const responseBodyEl = document.getElementById("response-body");
const responseHeadersEl = document.getElementById("response-headers");
const paramsContainer = document.getElementById("params");
const headersContainer = document.getElementById("headers");

const pageElement = new PageElement(paramsContainer, headersContainer, bodyEl)


methodEl.addEventListener("change", () => pageElement.updateBodyState());
addParamBtn.addEventListener("click", () => pageElement.addParamRow());
addHeaderBtn.addEventListener("click", () => pageElement.addHeaderRow());

sendBtn.addEventListener("click", sendRequest);
document.addEventListener("keydown", async(event) => {
        if (event.key === "Enter") {
            sendRequest();
        }
    }    
)
    
async function sendRequest() {
    const fullUrl = buildRequestUrl();
    if (!fullUrl) {
        setError("Enter a URL.");
        return;
    }

    const method = methodEl.value;

    const headers = collectRequestHeaders();

    let body = null;

    if (METHODS_WITH_BODY.has(method)) {
        const raw = bodyEl.value.trim();
        if (raw) {
            let isJSON = true;
            try {
                JSON.parse(raw);
            } catch {
                isJSON = false;
            }

            if (!headers["Content-Type"] && isJSON) {
                headers["Content-Type"] = "application/json";
            }

            body = raw;
        }
    }

    sendBtn.disabled = true;
    statusEl.textContent = "sending...";
    statusEl.className = "status-badge";
    responseBodyEl.textContent = "";
    responseHeadersEl.textContent = "";

    try {
        const res = await window.api.request({
            url: fullUrl,
            method,
            headers,
            body,
        });

        if (res.error) {
            throw new Error(res.error);
        }

        const ok = res.status >= 200 && res.status < 300;

        statusEl.textContent = `${res.status}`;
        statusEl.className = `status-badge ${ok ? "ok" : "err"}`;

        const headerLines = Object.entries(res.headers || {}).map(
            ([k, v]) => `${k}: ${v}`
        );
        responseHeadersEl.textContent =
            headerLines.join("\n") || "(no headers)";

        const text = res.body;

        if (!text) {
            responseBodyEl.textContent = "(empty body)";
            return;
        }

        try {
            const parsed = JSON.parse(text);
            responseBodyEl.textContent = JSON.stringify(parsed, null, 2);
        } catch {
            responseBodyEl.textContent = text;
        }
    } catch (err) {
        setError(String(err));
    } finally {
        sendBtn.disabled = false;
    }
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};

function setError(msg) {
    statusEl.textContent = "Error";
    statusEl.className = "status-badge err";
    responseBodyEl.textContent = msg;
    responseHeadersEl.textContent = "";
}

pageElement.addParamRow();
pageElement.addHeaderRow();
updateBodyState();
