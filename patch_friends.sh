sed -i "s/setFriends(friendList);/setFriends(friendList.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i));/" src/components/Friends.tsx
