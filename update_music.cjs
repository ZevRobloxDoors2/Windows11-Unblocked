const fs = require('fs');
let code = fs.readFileSync('public/Apps/Win Music.html', 'utf8');

const visualizerHtml = `
    <!-- Visualizer Canvas -->
    <canvas id="visualizer" style="position:absolute; inset:0; width:100%; height:100%; z-index:-1; pointer-events:none; opacity:0.6;"></canvas>
`;

code = code.replace(
  "<div id=\"art-zone\">",
  visualizerHtml + "\n        <div id=\"art-zone\">"
);

const visualizerJs = `
    // --- Web Audio API Visualizer ---
    let audioCtx, analyser, source, dataArray, bufferLength;
    let canvas, canvasCtx;

    function initVisualizer() {
        if (audioCtx) return;
        
        canvas = document.getElementById('visualizer');
        canvasCtx = canvas.getContext('2d');
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        
        // Connect audio element
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        drawVisualizer();
    }

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        if (!analyser) return;

        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        let barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 2;
            
            // Dynamic color based on frequency
            let r = barHeight + (25 * (i/bufferLength));
            let g = 250 * (i/bufferLength);
            let b = 255;
            
            canvasCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ', 0.5)';
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            
            x += barWidth + 1;
        }
    }
`;

code = code.replace(
  "const audio = document.getElementById('player');",
  "const audio = document.getElementById('player');\n" + visualizerJs
);

code = code.replace(
  "audio.src = track.preview_url;",
  "initVisualizer();\n            if (audioCtx.state === 'suspended') audioCtx.resume();\n            audio.crossOrigin = 'anonymous';\n            audio.src = track.preview_url;"
);

fs.writeFileSync('public/Apps/Win Music.html', code);
