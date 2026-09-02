const fs = require('fs');
let code = fs.readFileSync('src/components/Window.tsx', 'utf8');

code = code.replace(
  "export const Window = ({ title, onClose, onMinimize, onGuide, isActive = true, onFocus, children, className = '' }",
  "export const Window = ({ title, onClose, onMinimize, onGuide, isActive = true, isMinimized = false, onFocus, children, className = '' }"
);

fs.writeFileSync('src/components/Window.tsx', code);
