import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function DMCAModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-dmca', handleOpen);
    return () => window.removeEventListener('open-dmca', handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black mb-6 text-white">DMCA Policy</h2>
            
            <div className="overflow-y-auto pr-4 text-zinc-300 space-y-4 text-sm leading-relaxed">
              <p>
                If you believe that any copyright infringement exists on the site, please use the following process to notify us. We will act expeditiously to remove infringing material once informed. All claims of copyright infringement should be in writing and should be directed to:
              </p>
              
              <div className="bg-black/50 p-4 rounded-lg font-mono text-green-400 border border-green-500/20">
                email: darden.networkproxys@gmail.com
              </div>

              <p className="font-bold text-white mt-6 mb-2">Your notice must contain the following information:</p>
              
              <ul className="list-disc pl-6 space-y-3">
                <li>Your physical or electronic signature (as either the owner of an exclusive right that is allegedly infringed or as a person authorized to act on behalf of such owner).</li>
                <li>Identification of the copyrighted work claimed to have been infringed or, if multiple copyrighted works at a single online site are covered by a single claim, a representative list of such works at that online site.</li>
                <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled and information reasonably sufficient to permit us to locate the material.</li>
                <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number and, if available, an electronic mail address.</li>
                <li>A statement that you believe in good faith that use of the material in the manner complained of is not authorized by the copyright owner, its agent or the law.</li>
                <li>A statement that the information in the notice is accurate and that, under penalty of perjury, you are the owner of an exclusive right that is allegedly infringed or are authorized to act on behalf of such owner.</li>
              </ul>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end shrink-0">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
