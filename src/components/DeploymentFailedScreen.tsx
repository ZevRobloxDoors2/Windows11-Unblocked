import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Terminal, ShieldAlert } from 'lucide-react';

export const DeploymentFailedScreen: React.FC = () => {
  const [glitchText, setGlitchText] = useState<string>('01000100 01000101 01010000 01001100 01001111 01001001 01001101 01000101 01001110 01010100 01011111 01000110 01000001 01001001 01001100 01000101 01000100');
  const [subWords, setSubWords] = useState<string>('[CRITICAL_FAULT] 01110011 01111001 01110011 01110100 01100101 01101101 _ 01110011 01110100 01100001 01110100 01110101 01110011 _ 01110011 01110101 01100011 01101001 01100101 01101110 01110100');

  useEffect(() => {
    const techWords = [
      '[SECURITY_BREACH_DETECTED]', '[MEMORY_ACCESS_VIOLATION]', '[0x80070005_ACCESS_DENIED]',
      '[KERNEL_PANIC_EXCEPTION]', '[UNBLOCKED_BYPASS_FAILED]', '[HOST_DOMAIN_RESTRICTION_ACTIVE]',
      '01000011 01010011 01000101 01010011 01010011 01001001 01001111 01001110 01011111 01010011 01000101 01000011 01010101 01010010 01000101',
      '01010011 01010000 01010101 01011111 01001000 01000001 01001100 01010100',
      '[SYSTEM_HALTED]', '[OVERFLOW_STACK_TRACE_0x00]', '[STACK_OVERFLOW_CORRUPTION]',
      '01000101 01010010 01010010 01001111 01010010 01011111 01000011 01001111 01000100 01000101',
      '[VITE_BUILD_PIPELINE_TERMINATED]'
    ];

    const interval = setInterval(() => {
      // Generate random binary string
      let bin = '';
      for (let i = 0; i < 48; i++) {
        bin += Math.random() > 0.5 ? '1' : '0';
        if (i % 8 === 7) bin += ' ';
      }
      setGlitchText(bin);

      // Pick random tech word
      const randomWord = techWords[Math.floor(Math.random() * techWords.length)];
      const randomWord2 = techWords[Math.floor(Math.random() * techWords.length)];
      setSubWords(`${randomWord} ${bin.substring(0, 20)} ${randomWord2}`);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center p-8 select-none font-mono overflow-hidden">
      {/* Background Matrix Grid Lines / Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
      <div className="absolute inset-0 bg-radial from-red-950/20 via-black to-black pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl"
      >
        <div className="w-20 h-20 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
          <AlertTriangle size={40} />
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-widest text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.8)] mb-6 animate-pulse">
          Deployment Failed
        </h1>

        <div className="bg-zinc-900/90 border border-red-500/40 rounded-2xl p-6 w-full shadow-2xl backdrop-blur-xl flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-red-400 border-b border-white/10 pb-3">
            <span className="flex items-center gap-2"><Terminal size={14} /> HOST_VERIFICATION_CHECK_FAILED</span>
            <span className="flex items-center gap-2"><Terminal size={14} /> GO TO: https://windows11-unblocked.pages.dev/</span>
            <span className="animate-ping w-2 h-2 rounded-full bg-red-500" />
          </div>

          <div className="text-xl md:text-2xl font-mono text-green-400 font-bold tracking-wider py-3 break-all drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
            {glitchText}
          </div>

          <div className="text-xs md:text-sm text-zinc-400 font-mono tracking-tight bg-black/60 p-4 rounded-xl border border-white/5 break-all">
            {subWords}
          </div>
        </div>

        <p className="text-zinc-500 text-xs mt-8">
          Domain mismatch detected: <span className="text-red-400 font-semibold">zevrobloxdoors2.github.io/Windows11-Unblocked</span> is blacklisted or deployment validation rejected the host.
        </p>
      </motion.div>
    </div>
  );
};
