const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const cloakLogic = `
  useEffect(() => {
    // Tab Cloak
    const title = localStorage.getItem('cloak_title');
    const icon = localStorage.getItem('cloak_icon');
    if (title) document.title = title;
    if (icon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = icon;
    }

    // Auto about:blank
    if (localStorage.getItem('auto_about_blank') === 'true') {
      if (window.location.href !== 'about:blank' && window.self === window.top) {
        let win = window.open('about:blank', '_blank');
        if (win) {
          let iframe = win.document.createElement('iframe');
          iframe.src = window.location.href;
          iframe.style.width = '100vw';
          iframe.style.height = '100vh';
          iframe.style.border = 'none';
          iframe.style.margin = '0';
          iframe.style.padding = '0';
          win.document.body.style.margin = '0';
          win.document.body.appendChild(iframe);
          window.location.replace('https://www.google.com');
        }
      }
    }
  }, []);
`;

content = content.replace("useSpatialNavigation();", cloakLogic + "\n  useSpatialNavigation();");

fs.writeFileSync('src/App.tsx', content, 'utf8');
