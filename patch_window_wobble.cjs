const fs = require('fs');
let code = fs.readFileSync('src/components/Window.tsx', 'utf8');

// replace motion import
code = code.replace(
  "import { motion, useDragControls } from 'motion/react';", 
  "import { motion, useDragControls, useMotionValue, useVelocity, useSpring, useTransform } from 'motion/react';"
);

// add motion values
const oldState = `const dragControls = useDragControls();`;
const newState = `const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xVelocity = useVelocity(x);
  const yVelocity = useVelocity(y);
  
  const smoothVelocityX = useSpring(xVelocity, { damping: 50, stiffness: 400 });
  const smoothVelocityY = useSpring(yVelocity, { damping: 50, stiffness: 400 });
  
  const skewX = useTransform(smoothVelocityX, [-1000, 1000], [5, -5]);
  const skewY = useTransform(smoothVelocityY, [-1000, 1000], [-5, 5]);`;
code = code.replace(oldState, newState);

// update style to include x, y, skewX, skewY
const oldStyle = `resize: windowState === 'floating' ? 'both' : 'none',
        minWidth: 300,
        minHeight: 200,
        top: windowState === 'floating' ? '10%' : undefined,
        left: windowState === 'floating' ? '10%' : undefined,`;
const newStyle = `x,
        y,
        skewX: windowState === 'floating' ? skewX : 0,
        skewY: windowState === 'floating' ? skewY : 0,
        resize: windowState === 'floating' ? 'both' : 'none',
        minWidth: 300,
        minHeight: 200,
        top: windowState === 'floating' ? '10%' : undefined,
        left: windowState === 'floating' ? '10%' : undefined,`;
code = code.replace(oldStyle, newStyle);

fs.writeFileSync('src/components/Window.tsx', code);
