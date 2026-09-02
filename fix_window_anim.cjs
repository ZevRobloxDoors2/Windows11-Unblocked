const fs = require('fs');
let code = fs.readFileSync('src/components/Window.tsx', 'utf8');

code = code.replace(
  "const getAnimationProps = () => {\n    if (isMinimized) return { opacity: 0, scale: 0.8, pointerEvents: 'none', y: 50 };",
  "const getAnimationProps = () => {\n    if (isMinimized) return { opacity: 0, scale: 0.8, pointerEvents: 'none', y: 50 };"
);

// wait, let's just make getAnimationProps return an object that always has opacity and pointerEvents.
const newGetAnimationProps = `const getAnimationProps = () => {
    if (isMinimized) return { opacity: 0, scale: 0.8, pointerEvents: 'none', y: 50 };
    const base = { opacity: 1, scale: 1, pointerEvents: 'auto' };
    switch (windowState) {
      case 'maximized':
        return { ...base, top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'left':
        return { ...base, top: 0, left: 0, width: '50%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'right':
        return { ...base, top: 0, left: '50%', width: '50%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'floating':
      default:
        // When floating, let drag control the x/y, but give it a default centered start
        return { ...base, width: '80%', height: '75%' };
    }
  };`;

code = code.replace(/const getAnimationProps = \(\) => \{[\s\S]*?return \{ width: '80%', height: '75%' \};\n    \}\n  \};/, newGetAnimationProps);

// then change animate to not have hardcoded opacity: 1, scale: 1
code = code.replace("animate={{ opacity: 1, scale: 1, ...getAnimationProps() }}", "animate={getAnimationProps()}");

fs.writeFileSync('src/components/Window.tsx', code);
