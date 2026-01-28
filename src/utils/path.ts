/**
 * Normalize and sanitize user-provided paths or URLs
 */
export function sanitizePath(input: string): string {
    if (typeof input !== 'string') {
        input = String(input ?? '')
    }

    const sanitizedPath = input
        // strip protocol + host
        .replace(/^[a-zA-Z]+:\/\/[^/]+/, '')
        // normalize slashes
        .replace(/\\/g, '/')
        // kill traversal (your exact rule)
        .replace(/(\.+)?\.?\.\//g, '')
        // collapse slashes
        .replace(/\/{2,}/g, '/')
        // trim edges
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')

    if (sanitizedPath === '') {
        return '/'
    }

    return `/${sanitizedPath}`
}
