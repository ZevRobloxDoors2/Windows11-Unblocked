import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace applyDropboxCloak
pattern = r"const applyDropboxCloak = \(\) => \{.*?(?=\n  const getUrl = )"
new_func = """const applyDropboxCloak = () => {
    const code = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>body,html{margin:0;padding:0;height:100%;overflow:hidden;}</style>
        <title>${localStorage.getItem('cloak_title') || 'Google'}</title>
        <link rel="icon" href="${localStorage.getItem('cloak_icon') || 'https://www.google.com/favicon.ico'}">
      </head>
      <body>
        <iframe src="${window.location.href}" style="border:none;width:100%;height:100%;margin:0;padding:0;"></iframe>
      </body>
      </html>
    `;
    
    let win: any;
    if (dropboxSelection === 'blob') {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      win = window.open(url, '_blank');
      if (win) window.location.replace('https://classroom.google.com');
    } else if (dropboxSelection === 'filesystem') {
      const requestFileSystem = (window as any).requestFileSystem || (window as any).webkitRequestFileSystem;
      if (requestFileSystem) {
        requestFileSystem(0, 1024*1024, (fs: any) => {
          fs.root.getFile('index.html', {create: true}, (fileEntry: any) => {
            fileEntry.createWriter((fileWriter: any) => {
              const blob = new Blob([code], {type: 'text/html'});
              fileWriter.onwriteend = () => {
                win = window.open(fileEntry.toURL(), '_blank');
                if (win) window.location.replace('https://classroom.google.com');
                else alert('Popup blocker prevented the cloak! Please allow popups.');
              };
              fileWriter.write(blob);
            });
          });
        });
        return; 
      } else {
        alert("Filesystem protocol not supported in this browser. Falling back to about:blank.");
        win = window.open('about:blank', '_blank');
        if (win) { win.document.write(code); win.document.close(); window.location.replace('https://classroom.google.com'); }
      }
    } else {
      win = window.open('about:blank', '_blank');
      if (win) {
        win.document.write(code);
        win.document.close();
        window.location.replace('https://classroom.google.com');
      }
    }
    
    if (!win && dropboxSelection !== 'filesystem') {
      alert('Popup blocker prevented the cloak! Please allow popups.');
    }
  };
"""

content = re.sub(pattern, new_func, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
