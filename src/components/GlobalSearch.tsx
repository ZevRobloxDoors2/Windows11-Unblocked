import React from 'react';
export const GlobalSearch = ({ isOpen, onClose, onNavigate, onPlayGame }: any) => isOpen ? <div className="fixed inset-0 z-[500] bg-black/50 text-white p-10"><h2 className="text-xl mb-4">Search</h2><button onClick={onClose} className="bg-red-500 px-4 py-2">Close</button></div> : null;
