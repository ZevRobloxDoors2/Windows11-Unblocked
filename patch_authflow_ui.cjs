const fs = require('fs');
let content = fs.readFileSync('src/components/AuthFlow.tsx', 'utf8');

const oldLockscreen = `          <motion.div 
            key="lockscreen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="z-10 mt-32 flex flex-col items-center text-white drop-shadow-lg cursor-pointer w-full h-full"
            onClick={() => setView('login')}
          >
            <div className="text-[6rem] font-medium leading-none tracking-tight">
              {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="text-xl font-medium mt-2">
              {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="absolute bottom-12 flex flex-col items-center animate-bounce opacity-70">
              <span className="text-sm mb-2">Click or swipe up to unlock</span>
              <div className="w-6 h-6 border-b-2 border-r-2 border-white transform rotate-45" />
            </div>
          </motion.div>`;

const newLockscreen = `          <motion.div 
            key="lockscreen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="z-10 absolute inset-0 pt-32 flex flex-col items-center text-white drop-shadow-lg cursor-pointer"
            onClick={() => setView('login')}
          >
            <div className="text-[6rem] font-medium leading-none tracking-tight">
              {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="text-xl font-medium mt-2">
              {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="absolute bottom-12 flex flex-col items-center animate-bounce opacity-70">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white transform rotate-45 mb-2 mt-2" />
              <span className="text-sm">Click or swipe up to unlock</span>
            </div>
          </motion.div>`;

content = content.replace(oldLockscreen, newLockscreen);
fs.writeFileSync('src/components/AuthFlow.tsx', content);
