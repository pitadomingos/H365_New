const fs = require('fs');
const file = 'patient-portal-app/src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add title="button" to buttons without title
code = code.replace(/<button(?![^>]*title=)([^>]*)>/g, '<button title="button"$1>');

// Add title="select" to selects without title
code = code.replace(/<select(?![^>]*title=)([^>]*)>/g, '<select title="select"$1>');

// Add title="input" to inputs without title
code = code.replace(/<input(?![^>]*title=)([^>]*)>/g, '<input title="input"$1>');

fs.writeFileSync(file, code);
console.log('Fixed missing titles in App.tsx');
