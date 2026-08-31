const fs = require('fs');

function fix(path, from, to) {
    let text = fs.readFileSync(path, 'utf8');
    text = text.replaceAll(from, to);
    fs.writeFileSync(path, text);
}

fix('src/App.tsx', 'setProfile(null);\n      }\n      setProfileLoaded(true);\n    });', 'setProfile(null);\n      }\n      setProfileLoaded(true);\n    }, (err) => { console.warn(err); });');

fix('src/components/Notifications.tsx', 'setRequests(data);\n    });', 'setRequests(data);\n    }, (err) => { console.warn(err); });');
fix('src/components/Notifications.tsx', 'setAlerts(data);\n    });', 'setAlerts(data);\n    }, (err) => { console.warn(err); });');

fix('src/components/Chat.tsx', 'setTypingUsers(typing);\n    });', 'setTypingUsers(typing);\n    }, (err) => { console.warn(err); });');

fix('src/components/Friends.tsx', 'setFriends(list);\n        setLoading(false);\n    });', 'setFriends(list);\n        setLoading(false);\n    }, (err) => { console.warn(err); });');
fix('src/components/Friends.tsx', 'setRecommended(recs);\n        setLoadingRecs(false);\n    });', 'setRecommended(recs);\n        setLoadingRecs(false);\n    }, (err) => { console.warn(err); });');

fix('src/components/GlobalNotifications.tsx', 'setTimeout(() => {\n                setActiveToasts(prev => prev.filter(t => t.id !== notifId));\n              }, 5000);\n            }\n          }\n        }\n      });\n    });', 'setTimeout(() => {\n                setActiveToasts(prev => prev.filter(t => t.id !== notifId));\n              }, 5000);\n            }\n          }\n        }\n      });\n    }, (err) => { console.warn(err); });');

