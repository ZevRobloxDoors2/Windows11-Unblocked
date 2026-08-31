const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');
content = content.replace("&& (data.keys().hasAny(['quickResumeEnabled']) ? data.quickResumeEnabled is bool : true);", 
"&& (data.keys().hasAny(['quickResumeEnabled']) ? data.quickResumeEnabled is bool : true)\n        && (data.keys().hasAny(['pin']) ? data.pin is string && data.pin.size() <= 10 : true);");
fs.writeFileSync('firestore.rules', content);
