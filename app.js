(function () {
    const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

    const methodEl = document.getElementById("method");
    const urlEl = document.getElementById("url");
    const paramsContainer = document.getElementById("params");
    const addParamBtn = document.getElementById("add-param");
    const headersContainer = document.getElementById("headers");
    const addHeaderBtn = document.getElementById("add-header");
    const bodyEl = document.getElementById("body");
    const sendBtn = document.getElementById("send");
    const statusEl = document.getElementById("status");
    const responseBodyEl = document.getElementById("response-body");
    const responseHeadersEl = document.getElementById("response-headers");

    function addParamRow(key = "", value = "") {
        const row = document.createElement("div");
        row.className = "param-row";
        row.innerHTML = `
      <input type="text" class="param-key" placeholder="name" value="${escapeAttr(key)}" aria-label="Query parameter name" />
      <input type="text" class="param-value" placeholder="value" value="${escapeAttr(value)}" aria-label="Query parameter value" />
      <button type="button" class="btn-icon remove-param" title="Remove" aria-label="Remove parameter">&times;</button>
    `;
        row.querySelector(".remove-param").addEventListener("click", () => row.remove());
        paramsContainer.appendChild(row);
    }

    function addHeaderRow(name = "", value = "") {
        const row = document.createElement("div");
        row.className = "param-row";
        row.innerHTML = `
      <input type="text" class="header-name" placeholder="Name" value="${escapeAttr(name)}" aria-label="Header name" />
      <input type="text" class="header-value" placeholder="Value" value="${escapeAttr(value)}" aria-label="Header value" />
      <button type="button" class="btn-icon remove-header" title="Remove" aria-label="Remove header">&times;</button>
    `;
        row.querySelector(".remove-header").addEventListener("click", () => row.remove());
        headersContainer.appendChild(row);
    }

    function collectRequestHeaders() {
        const headers = {};
        headersContainer.querySelectorAll(".param-row").forEach((row) => {
            const name = row.querySelector(".header-name").value.trim();
            const value = row.querySelector(".header-value").value;
            if (name) headers[name] = value;
        });
        return headers;
    }

    function escapeAttr(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;");
    }

    function normalizeUrlInput() {
        let url = urlEl.value.trim();
        if (!url) return null;
        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
            urlEl.value = url;
        }
        return url;
    }

    function buildRequestUrl() {
        const base = normalizeUrlInput();
        if (!base) return null;
        const u = new URL(base);
        paramsContainer.querySelectorAll(".param-row").forEach((row) => {
            const key = row.querySelector(".param-key").value.trim();
            const value = row.querySelector(".param-value").value;
            if (key) u.searchParams.append(key, value);
        });
        return u.toString();
    }

    function updateBodyState() {
        bodyEl.disabled = !METHODS_WITH_BODY.has(methodEl.value);
    }

    methodEl.addEventListener("change", updateBodyState);
    addParamBtn.addEventListener("click", () => addParamRow());
    addHeaderBtn.addEventListener("click", () => addHeaderRow());

    sendBtn.addEventListener("click", async () => {
        const fullUrl = buildRequestUrl();
        if (!fullUrl) {
            setError("Enter a URL.");
            return;
        }

        const method = methodEl.value;

        const headers = {};
        headersContainer.querySelectorAll(".param-row").forEach((row) => {
            const name = row.querySelector(".header-name").value.trim();
            const value = row.querySelector(".header-value").value;
            if (name) headers[name] = value;
        });

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
        statusEl.textContent = "(sending...)";
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
            statusEl.textContent = "Error";
            statusEl.className = "status-badge err";
            responseBodyEl.textContent = err.message || String(err);
            responseHeadersEl.textContent = "";
        } finally {
            sendBtn.disabled = false;
        }
    });

    function setError(msg) {
        statusEl.textContent = "Error";
        statusEl.className = "status-badge err";
        responseBodyEl.textContent = msg;
        responseHeadersEl.textContent = "";
    }

    addParamRow();
    addHeaderRow();
    updateBodyState();
})();
