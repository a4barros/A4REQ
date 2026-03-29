
export function escapeAttr(s) {
    return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function normalizeUrlInput(urlEl) {
    let url = urlEl.value.trim();
    if (!url) return null;
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
        urlEl.value = url;
    }
    return url;
}