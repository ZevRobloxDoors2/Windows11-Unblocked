const fs = require('fs');
let code = fs.readFileSync('src/components/Window.tsx', 'utf8');

// Update Window props to include isMinimized
code = code.replace(
  "isActive?: boolean, onFocus?: () => void, children: ReactNode, className?: string, key?: string | number }) => {",
  "isActive?: boolean, isMinimized?: boolean, onFocus?: () => void, children: ReactNode, className?: string, key?: string | number }) => {"
);

// Update getAnimationProps to handle isMinimized
code = code.replace(
  "const getAnimationProps = () => {",
  "const getAnimationProps = () => {\n    if (isMinimized) return { opacity: 0, scale: 0.8, pointerEvents: 'none', y: 50 };"
);

// Fix the DOM unmounting issue (lines 121-126)
code = code.replace(
  "{isActive && !isDragging ? children : (\n           <div className=\"w-full h-full relative\">\n              <div className=\"absolute inset-0 z-50 bg-transparent\" />\n              {children}\n           </div>\n        )}",
  "<div className=\"w-full h-full relative\">\n          {(!isActive || isDragging) && <div className=\"absolute inset-0 z-50 bg-transparent\" />}\n          {children}\n        </div>"
);

fs.writeFileSync('src/components/Window.tsx', code);
