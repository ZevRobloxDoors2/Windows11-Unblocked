const fs = require('fs');
let code = fs.readFileSync('src/components/Window.tsx', 'utf8');

const oldStartDrag = `const startDrag = (e: any) => {
    if (windowState !== 'floating') {
       setWindowState('floating');
    }
    setIsDragging(true);
    dragControls.start(e);
  };`;
const newStartDrag = `const startDrag = (e: any) => {
    if (windowState !== 'floating') {
       setWindowState('floating');
       x.set(0);
       y.set(0);
    }
    setIsDragging(true);
    dragControls.start(e);
  };`;
code = code.replace(oldStartDrag, newStartDrag);

const oldHandleDragEnd = `// Snapping logic
    if (point.y < 20) {
      setWindowState('maximized');
    } else if (point.x < 20) {
      setWindowState('left');
    } else if (point.x > screenWidth - 20) {
      setWindowState('right');
    }`;
const newHandleDragEnd = `// Snapping logic
    if (point.y < 20) {
      setWindowState('maximized');
      x.set(0); y.set(0);
    } else if (point.x < 20) {
      setWindowState('left');
      x.set(0); y.set(0);
    } else if (point.x > screenWidth - 20) {
      setWindowState('right');
      x.set(0); y.set(0);
    }`;
code = code.replace(oldHandleDragEnd, newHandleDragEnd);

const oldToggleMaximize = `const toggleMaximize = () => {
    if (windowState === 'maximized') {
      setWindowState('floating');
    } else {
      setWindowState('maximized');
    }
  };`;
const newToggleMaximize = `const toggleMaximize = () => {
    if (windowState === 'maximized') {
      setWindowState('floating');
    } else {
      setWindowState('maximized');
      x.set(0); y.set(0);
    }
  };`;
code = code.replace(oldToggleMaximize, newToggleMaximize);

fs.writeFileSync('src/components/Window.tsx', code);
