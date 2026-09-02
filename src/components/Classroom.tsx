import React, { useState } from 'react';
import { Play, Maximize2 } from 'lucide-react';

export function Classroom() {
  const [html, setHtml] = useState('<h1>Hello World</h1>\n<p>Doing my missing work...</p>');
  const [css, setCss] = useState('body {\n  background: #f0f2f5;\n  font-family: sans-serif;\n  padding: 2rem;\n}\nh1 {\n  color: #1a73e8;\n}');
  const [js, setJs] = useState('console.log("Ready!");');
  
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full bg-white text-zinc-900 font-sans">
      {/* Fake Classroom Header */}
      <div className="h-14 border-b border-zinc-200 flex items-center px-4 justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg leading-none pt-0.5">=</div>
          <span className="text-xl text-zinc-600 font-medium">Google Classroom</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-600">
          <span className="border-b-4 border-green-700 pb-[18px] text-green-700 mt-[22px]">Stream</span>
          <span>Classwork</span>
          <span>People</span>
          <span>Grades</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">S</div>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-zinc-200 bg-[#1e1e1e] text-white">
          <div className="flex flex-col h-1/3 border-b border-zinc-700">
             <div className="bg-zinc-800 text-xs px-3 py-1 text-zinc-400 font-mono">index.html</div>
             <textarea 
               value={html} 
               onChange={e => setHtml(e.target.value)}
               className="flex-1 bg-transparent text-sm p-3 font-mono focus:outline-none resize-none"
               spellCheck={false}
             />
          </div>
          <div className="flex flex-col h-1/3 border-b border-zinc-700">
             <div className="bg-zinc-800 text-xs px-3 py-1 text-zinc-400 font-mono">style.css</div>
             <textarea 
               value={css} 
               onChange={e => setCss(e.target.value)}
               className="flex-1 bg-transparent text-sm p-3 font-mono focus:outline-none resize-none"
               spellCheck={false}
             />
          </div>
          <div className="flex flex-col h-1/3">
             <div className="bg-zinc-800 text-xs px-3 py-1 text-zinc-400 font-mono">script.js</div>
             <textarea 
               value={js} 
               onChange={e => setJs(e.target.value)}
               className="flex-1 bg-transparent text-sm p-3 font-mono focus:outline-none resize-none"
               spellCheck={false}
             />
          </div>
        </div>
        <div className="w-1/2 bg-white flex flex-col">
          <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Preview (Missing Assignment: Web Dev 101)</span>
          </div>
          <iframe 
            srcDoc={srcDoc} 
            className="w-full flex-1 border-none bg-white"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}
