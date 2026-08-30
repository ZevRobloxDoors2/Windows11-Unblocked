const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(/    match \/systemAlerts.*?\}\n\n    match \/systemAlerts.*?$/s, ''); // try to remove double append if any
fs.writeFileSync('firestore.rules', rules);
