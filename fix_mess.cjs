const fs = require('fs');

function fix(file) {
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(/, \(err\) => console\.warn\(err\)/g, '');
    text = text.replace(/, \(err\) => console\.warn\("Snapshot:", err\.message\)/g, '');
    fs.writeFileSync(file, text);
}

['src/components/Chat.tsx', 'src/components/Friends.tsx', 'src/components/Notifications.tsx', 'src/components/Party.tsx', 'src/components/GlobalNotifications.tsx', 'src/App.tsx'].forEach(fix);
