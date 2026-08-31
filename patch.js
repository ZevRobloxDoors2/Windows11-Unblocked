const fs = require('fs');
let content = fs.readFileSync('src/components/Window.tsx', 'utf8');
content = content.replace(
  "{isActive ? children : (",
  "{isActive && !isDragging ? children : ("
);
fs.writeFileSync('src/components/Window.tsx', content);
