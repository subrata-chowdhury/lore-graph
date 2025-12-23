'use client'
// Function to get a cookie value by name
function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const part = parts.pop();
        if (part) return part.split(';').shift();
    }
}

export { getCookie };