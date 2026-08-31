const fs = require('fs');

function fixFile(path, oldText, newText) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(oldText, newText);
    fs.writeFileSync(path, content);
}

fixFile('src/components/Chat.tsx', 'setTypingUsers(typing);\n    });', 'setTypingUsers(typing);\n    }, (err) => { console.warn(err); });');
fixFile('src/components/Chat.tsx', 'if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;\n      }, 100);\n      \n      // Mark as read', 'if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;\n      }, 100);\n      \n      // Mark as read');
fixFile('src/components/Chat.tsx', 'updateDoc(doc(db, `chats/${computedChatId}/messages`, m.id), {\n                 readBy: arrayUnion(userProfile.gamertag)\n              }).catch(() => {});\n           });\n        }\n      });\n    });', 'updateDoc(doc(db, `chats/${computedChatId}/messages`, m.id), {\n                 readBy: arrayUnion(userProfile.gamertag)\n              }).catch(() => {});\n           });\n        }\n      });\n    }, (err) => { console.warn(err); });');

fixFile('src/components/Friends.tsx', 'setFriends(list);\n        setLoading(false);\n    });', 'setFriends(list);\n        setLoading(false);\n    }, (err) => { console.warn(err); });');
fixFile('src/components/Friends.tsx', 'setRecommended(recs);\n        setLoadingRecs(false);\n    });', 'setRecommended(recs);\n        setLoadingRecs(false);\n    }, (err) => { console.warn(err); });');

fixFile('src/components/Notifications.tsx', 'setRequests(data);\n    });', 'setRequests(data);\n    }, (err) => { console.warn(err); });');
fixFile('src/components/Notifications.tsx', 'setAlerts(data);\n    });', 'setAlerts(data);\n    }, (err) => { console.warn(err); });');

fixFile('src/components/Party.tsx', 'setPartyMembers(list);\n      });\n\n      // Also fetch members initially to check if we are in it', 'setPartyMembers(list);\n      }, (err) => { console.warn(err); });\n\n      // Also fetch members initially to check if we are in it');
fixFile('src/components/Party.tsx', 'if (change.type === \'added\') {\n              setIncomingSignals(prev => [...prev.filter(s => s.id !== signalId), { id: signalId, ...data }]);\n            }\n          });\n        });', 'if (change.type === \'added\') {\n              setIncomingSignals(prev => [...prev.filter(s => s.id !== signalId), { id: signalId, ...data }]);\n            }\n          });\n        }, (err) => { console.warn(err); });');
fixFile('src/components/Party.tsx', 'if (list.length > 0) {\n          setJoinRequests(list);\n        }\n      });', 'if (list.length > 0) {\n          setJoinRequests(list);\n        }\n      }, (err) => { console.warn(err); });');

fixFile('src/components/GlobalNotifications.tsx', 'setTimeout(() => {\n                setActiveToasts(prev => prev.filter(t => t.id !== notifId));\n              }, 5000);\n            }\n          }\n        }\n      });\n    });', 'setTimeout(() => {\n                setActiveToasts(prev => prev.filter(t => t.id !== notifId));\n              }, 5000);\n            }\n          }\n        }\n      });\n    }, (err) => { console.warn(err); });');

fixFile('src/App.tsx', 'setNotificationCount(reqsCount + alertsCount);\n    });\n    \n    const unsubAlerts', 'setNotificationCount(reqsCount + alertsCount);\n    }, (err) => { console.warn(err); });\n    \n    const unsubAlerts');
fixFile('src/App.tsx', 'setNotificationCount(reqsCount + alertsCount);\n    });\n    \n    return () => { unsubReqs(); unsubAlerts(); };', 'setNotificationCount(reqsCount + alertsCount);\n    }, (err) => { console.warn(err); });\n    \n    return () => { unsubReqs(); unsubAlerts(); };');
fixFile('src/App.tsx', 'setProfile(null);\n      }\n      setProfileLoaded(true);\n    });', 'setProfile(null);\n      }\n      setProfileLoaded(true);\n    }, (err) => { console.warn(err); });');

