// Staging build (vite --mode staging, served at /campil/staging/) talks to a separate Firebase project and must
// never share device storage with production, which lives on the same origin. Every storage name goes through `key`.
export const STAGING = import.meta.env.MODE === 'staging';
export const key = (name: string) => (STAGING ? name.replace(/^campil-/, 'campil-stg-') : name);
