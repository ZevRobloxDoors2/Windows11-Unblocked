const fs = require('fs');

function replaceFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const [oldStr, newStr] of replacements) {
        content = content.replace(oldStr, newStr);
    }
    fs.writeFileSync(path, content);
}

replaceFile('src/components/Chat.tsx', [
    [
        `    const unsubTyping = onSnapshot(qTyping, (snap) => {\n      snap.docChanges().forEach(change => {\n        if (change.type === 'added') setOpponentTyping(true);\n        if (change.type === 'removed') setOpponentTyping(false);\n      });\n    });`,
        `    const unsubTyping = onSnapshot(qTyping, (snap) => {\n      snap.docChanges().forEach(change => {\n        if (change.type === 'added') setOpponentTyping(true);\n        if (change.type === 'removed') setOpponentTyping(false);\n      });\n    }, (err) => console.warn(err));`
    ],
    [
        `        setIsLoading(false);\n      });\n      // scroll to bottom after initial load`,
        `        setIsLoading(false);\n      }, (err) => console.warn(err));\n      // scroll to bottom after initial load`
    ]
]);

replaceFile('src/components/Friends.tsx', [
    [
        `        });\n        setFriends(list);\n        setLoading(false);\n    });`,
        `        });\n        setFriends(list);\n        setLoading(false);\n    }, (err) => console.warn(err));`
    ],
    [
        `        });\n        setRecommended(recs);\n        setLoadingRecs(false);\n    });`,
        `        });\n        setRecommended(recs);\n        setLoadingRecs(false);\n    }, (err) => console.warn(err));`
    ]
]);

replaceFile('src/components/Notifications.tsx', [
    [
        `      });\n      setRequests(data);\n    });`,
        `      });\n      setRequests(data);\n    }, (err) => console.warn(err));`
    ],
    [
        `      });\n      setAlerts(data);\n    });`,
        `      });\n      setAlerts(data);\n    }, (err) => console.warn(err));`
    ]
]);

replaceFile('src/components/Party.tsx', [
    [
        `        setPartyMembers(list);\n      });\n\n      // Also fetch members initially to check if we are in it`,
        `        setPartyMembers(list);\n      }, (err) => console.warn(err));\n\n      // Also fetch members initially to check if we are in it`
    ],
    [
        `          });\n        });`,
        `          });\n        }, (err) => console.warn(err));`
    ],
    [
        `        if (list.length > 0) {\n          setJoinRequests(list);\n        }\n      });`,
        `        if (list.length > 0) {\n          setJoinRequests(list);\n        }\n      }, (err) => console.warn(err));`
    ]
]);

replaceFile('src/components/GlobalNotifications.tsx', [
    [
        `            }\n          }\n        }\n      });\n    });`,
        `            }\n          }\n        }\n      });\n    }, (err) => console.warn(err));`
    ]
]);

replaceFile('src/App.tsx', [
    [
        `      setNotificationCount(reqsCount + alertsCount);\n    }, (err) => console.warn("Snapshot:", err.message));`,
        `      setNotificationCount(reqsCount + alertsCount);\n    }, (err) => console.warn("Snapshot:", err.message));`
    ],
    [
        `      setNotificationCount(reqsCount + alertsCount);\n    }, (err) => console.warn("Snapshot:", err.message));`,
        `      setNotificationCount(reqsCount + alertsCount);\n    }, (err) => console.warn("Snapshot:", err.message));`
    ]
]);

