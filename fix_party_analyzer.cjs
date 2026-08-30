const fs = require('fs');
let code = fs.readFileSync('src/components/Party.tsx', 'utf8');

const targetStr = `      Object.entries(analyzers.current).forEach(([peerId, analyzer]) => {
        analyzer.getByteFrequencyData(dataArray);`;

const replacementStr = `      Object.entries(analyzers.current).forEach(([peerId, analyzer]) => {
        (analyzer as AnalyserNode).getByteFrequencyData(dataArray);`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/Party.tsx', code);
