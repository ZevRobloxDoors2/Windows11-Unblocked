import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send, MoreVertical, Edit2, Trash2, X , Image as ImageIcon } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface ChatProps {
  key?: string;
  userProfile: UserProfile;
  friendId?: string;
  friendGamertag?: string;
  chatId?: string;
  isGroup?: boolean;
  chatName?: string;
  onBack: () => void;
}

export function Chat({ userProfile, friendId, friendGamertag, chatId: propChatId, isGroup, chatName, onBack }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, { gamertag: string, lastTyped: number }>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate stable chat ID
  const computedChatId = isGroup && propChatId ? propChatId : [userProfile.uid, friendId].sort().join('_');
  const displayTitle = isGroup ? chatName : (friendGamertag === 'Friend' ? friendId?.substring(0,8) : friendGamertag);

  useEffect(() => {
    const qTyping = query(collection(db, `chats/${computedChatId}/typing`));
    const unsubTyping = onSnapshot(qTyping, (snap) => {
      const now = Date.now();
      const typing: Record<string, any> = {};
      snap.docs.forEach(doc => {
        if (doc.id !== userProfile.uid) {
           const data = doc.data();
           if (data.isTyping && (now - data.lastTyped) < 5000) {
              typing[doc.id] = data;
           }
        }
      });
      setTypingUsers(typing);
    });

    const q = query(collection(db, `chats/${computedChatId}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
      
      // Mark as read
      msgs.forEach(m => {
        if (m.senderId !== userProfile.uid && (!m.readBy || (!m.readBy.includes(userProfile.uid) && !m.readBy.includes(userProfile.gamertag)))) {
           import('firebase/firestore').then(({ updateDoc, doc, arrayUnion }) => {
              updateDoc(doc(db, `chats/${computedChatId}/messages`, m.id), {
                 readBy: arrayUnion(userProfile.gamertag)
              }).catch(() => {});
           });
        }
      });
    });
    return () => { unsubscribe(); unsubTyping(); };
  }, [computedChatId, userProfile.uid]);

  const handleEdit = async (msgId: string, newText: string) => {
    if (!newText.trim() || newText.length > 1000) return;
    try {
      await updateDoc(doc(db, `chats/${computedChatId}/messages`, msgId), {
        text: newText.trim(),
        editedAt: serverTimestamp()
      });
      setEditingMsg(null);
      setText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, `chats/${computedChatId}/messages`, msgId));
    } catch (e) {
      console.error(e);
    }
  };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            } else {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || text.length > 1000) return;
    if (editingMsg) {
      handleEdit(editingMsg, text);
      return;
    }
    setSending(true);
    try {
      let b64Image = null;
      if (imageFile) {
        b64Image = await processImage(imageFile);
      }
      const msgData: any = {
        senderId: userProfile.uid,
        senderName: userProfile.gamertag,
        text: text.trim(),
        createdAt: serverTimestamp()
      };
      if (b64Image) msgData.imageUrl = b64Image;
      
      await addDoc(collection(db, `chats/${computedChatId}/messages`), msgData);
      
      // Notify recipients
      import('firebase/firestore').then(async ({ getDoc, doc }) => {
        if (isGroup && propChatId) {
          const gcDoc = await getDoc(doc(db, 'groupChats', propChatId));
          if (gcDoc.exists()) {
            const members = gcDoc.data().members || [];
            members.forEach((mId: string) => {
              if (mId !== userProfile.uid) {
                addDoc(collection(db, 'notifications'), {
                  toUid: mId,
                  fromUid: userProfile.uid,
                  fromGamertag: userProfile.gamertag,
                  type: 'message',
                  isGroup: true,
                  chatId: computedChatId,
                  chatName: chatName || '',
                  read: false,
                  createdAt: serverTimestamp()
                }).catch(console.error);
              }
            });
          }
        } else if (friendId) {
          addDoc(collection(db, 'notifications'), {
            toUid: friendId,
            fromUid: userProfile.uid,
            fromGamertag: userProfile.gamertag,
            type: 'message',
            isGroup: false,
            chatId: computedChatId,
            read: false,
            createdAt: serverTimestamp()
          }).catch(console.error);
        }
      });
      
      setText('');
      setImageFile(null);
      setImagePreview(null);
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-4xl mx-auto flex flex-col pt-8 pb-12 h-full overflow-y-auto w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">{isGroup ? 'Group Chat: ' : 'Chat with '}{displayTitle}</h2>
        </div>
        {isGroup && (
          <button 
            onClick={() => {
              const friendTag = prompt("Enter the gamertag of the friend to invite:");
              if (!friendTag) return;
              import('firebase/firestore').then(async ({ getDocs, query, collection, where, doc, updateDoc, arrayUnion }) => {
                const q = query(collection(db, 'users'), where('gamertagLower', '==', friendTag.toLowerCase()));
                const snap = await getDocs(q);
                if (snap.empty) {
                  alert("User not found.");
                  return;
                }
                const fUid = snap.docs[0].id;
                await updateDoc(doc(db, 'groupChats', computedChatId), {
                  members: arrayUnion(fUid)
                });
                alert(`Added ${friendTag} to the group chat!`);
              });
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors"
          >
            Invite Friend
          </button>
        )}
      </div>
      
      <div className="flex-1 bg-zinc-900/50 mt-4 rounded-xl border border-white/10 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scroll" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <p>Say hello to start the chat!</p>
            </div>
          ) : (
            messages.map(m => {
              const isEditing = editingMsg === m.id;
              const showMenu = activeMenuId === m.id;
              const isMe = m.senderId === userProfile.uid;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'} relative`}>
                    {isGroup && !isMe && <p className="text-[11px] text-green-400 font-bold mb-1 opacity-80">{m.senderName || 'User'}</p>}
                    {(m as any).imageUrl && (
                      <div className="mb-2">
                        <a href={(m as any).imageUrl} target="_blank" rel="noopener noreferrer">
                          <img src={(m as any).imageUrl} className="max-w-full max-h-64 rounded-md object-contain cursor-zoom-in" />
                        </a>
                      </div>
                    )}
                    {m.text && (
                      <p className="break-words leading-relaxed text-[15px]">
                        {m.text}
                        {(m as any).editedAt && <span className="text-[10px] opacity-60 ml-2 italic">(edited)</span>}
                      </p>
                    )}
                    {isMe && m.readBy && m.readBy.filter(r => r !== userProfile.uid && r !== userProfile.gamertag).length > 0 && (
                      <div className="absolute -bottom-4 right-0 text-[10px] text-green-400 font-semibold flex flex-col items-end opacity-80 whitespace-nowrap z-10">
                         <span className="flex items-center gap-1">✓ Read {isGroup ? 'by' : ''}</span>
                         {isGroup && (
                            <span className="text-[9px] text-zinc-400">{m.readBy.filter(r => r !== userProfile.uid && r !== userProfile.gamertag).join(', ')}</span>
                         )}
                      </div>
                    )}
                    <span className={`text-[10px] opacity-60 block mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {m.createdAt ? (m.createdAt.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (typeof m.createdAt === 'number' || typeof m.createdAt === 'string' ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')) : 'Just now'}
                    </span>
                    
                    {isMe && (
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <button onClick={() => setActiveMenuId(showMenu ? null : m.id)} className="p-1 text-zinc-400 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                        {showMenu && (
                          <div className="absolute right-full top-0 mr-2 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 z-10 w-24">
                            <button onClick={() => { setEditingMsg(m.id); setText(m.text); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-700 flex items-center gap-2">
                              <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => { handleDelete(m.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {Object.keys(typingUsers).length > 0 && (
          <div className="px-6 py-2 text-xs text-zinc-400 italic bg-zinc-900 flex items-center gap-2">
            <div className="flex gap-1">
               <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {Object.values(typingUsers).map(u => (u as any).gamertag).join(', ')} {Object.values(typingUsers).length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div className="p-4 bg-zinc-900 border-t border-white/10 shrink-0">
          <div className="flex flex-col gap-2 w-full">
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-700">
                <img src={imagePreview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black">
                  <X size={14} />
                </button>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={!!editingMsg} />
              </label>
              <input 
                type="text" 
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  import('firebase/firestore').then(({ setDoc, doc }) => {
                    setDoc(doc(db, `chats/${computedChatId}/typing`, userProfile.uid), {
                      gamertag: userProfile.gamertag,
                      isTyping: e.target.value.length > 0,
                      lastTyped: Date.now()
                    }, { merge: true });
                  });
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => {
                    import('firebase/firestore').then(({ setDoc, doc }) => {
                      setDoc(doc(db, `chats/${computedChatId}/typing`, userProfile.uid), { isTyping: false }, { merge: true });
                    });
                  }, 2000);
                }}
                placeholder={editingMsg ? "Edit message..." : "Type a message..."}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-green-500 min-w-0"
              />
              {editingMsg && (
                <button type="button" onClick={() => { setEditingMsg(null); setText(''); }} className="bg-zinc-700 hover:bg-zinc-600 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <X size={20} />
                </button>
              )}
              <button 
                disabled={sending || (!text.trim() && !imageFile)} 
                type="submit" 
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={20} className="ml-[-2px]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
