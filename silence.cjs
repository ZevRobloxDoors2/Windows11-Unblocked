const fs = require('fs');

function fix(path) {
    let text = fs.readFileSync(path, 'utf8');
    text = text.replaceAll('(err) => { console.warn(err); }', '() => {}');
    text = text.replaceAll('(error) => {\n      console.warn(error);\n      setProfileLoaded(true);\n    }', '() => {\n      setProfileLoaded(true);\n    }');
    fs.writeFileSync(path, text);
}

fix('src/App.tsx');
fix('src/components/Notifications.tsx');
fix('src/components/Chat.tsx');
fix('src/components/Friends.tsx');
fix('src/components/GlobalNotifications.tsx');
fix('src/components/Party.tsx');

