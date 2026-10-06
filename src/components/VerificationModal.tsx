import React, { useState, useRef } from 'react';
import { CheckCircle, Camera, Upload, X, ShieldCheck } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface VerificationModalProps {
  onClose: () => void;
  userProfile?: any;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ onClose, userProfile }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [about, setAbout] = useState('');
  const [schoolIdImage, setSchoolIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturingId, setCapturingId] = useState(false);

  const startCamera = async () => {
    setCapturingId(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      alert("Could not access camera. Please upload a file instead.");
      setCapturingId(false);
    }
  };

  const capturePhoto = (isIdCard: boolean) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        if (isIdCard) {
          setSchoolIdImage(dataUrl);
        } else {
          setSelfieImage(dataUrl);
        }
      }
      // Stop stream
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCapturingId(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isIdCard: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (isIdCard) {
          setSchoolIdImage(result);
        } else {
          setSelfieImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      setError('First and Last Name are required.');
      return;
    }
    if (!schoolIdImage) {
      setError('School ID picture is [REQUIRED] for verification.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Save verification request
      await addDoc(collection(db, 'verifications'), {
        uid: userProfile?.uid || 'anonymous',
        username: userProfile?.username || 'User',
        fullName: `${firstName} ${lastName}`,
        about,
        schoolIdUrl: schoolIdImage,
        selfieUrl: selfieImage || null,
        status: 'Pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification request.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-zinc-950 border border-[#00A4EF]/40 rounded-2xl shadow-[0_0_50px_rgba(0,164,239,0.2)] flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A4EF]/20 border border-[#00A4EF] rounded-xl text-[#00A4EF]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                Apply for Official Verification <span className="text-[#00A4EF]">✓</span>
              </h2>
              <p className="text-xs text-zinc-400">Get your verified blue checkmark by submitting your credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {success ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center border border-green-500">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-xl font-bold text-white">Verification Application Submitted!</h3>
              <p className="text-sm text-zinc-400 max-w-md">Our moderation and administration team will review your School ID and details shortly. You will receive a notification once verified.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-500/25 border border-red-500 text-red-300 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter first name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00A4EF]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Last Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter last name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00A4EF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">About You / Everything About You</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about yourself, your role, school, or community contributions..." 
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00A4EF] resize-none"
                />
              </div>

              {/* School ID Required */}
              <div className="space-y-2 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    School ID Picture <span className="text-red-500 font-bold">[REQUIRED]</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={startCamera}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg flex items-center gap-1 text-zinc-200"
                    >
                      <Camera size={14} /> Camera
                    </button>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg flex items-center gap-1 text-zinc-200"
                    >
                      <Upload size={14} /> Upload File
                    </button>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, true)} 
                    />
                  </div>
                </div>

                {capturingId && (
                  <div className="flex flex-col items-center space-y-2 mt-2">
                    <video ref={videoRef} className="w-full h-48 bg-black rounded-lg object-cover" autoPlay playsInline />
                    <button 
                      type="button" 
                      onClick={() => capturePhoto(true)}
                      className="px-4 py-1.5 bg-[#00A4EF] hover:bg-[#0090d4] text-xs font-semibold rounded-lg text-white"
                    >
                      Capture ID Photo
                    </button>
                  </div>
                )}

                {schoolIdImage && !capturingId && (
                  <div className="mt-2 relative inline-block">
                    <img src={schoolIdImage} alt="School ID Preview" className="w-32 h-20 rounded-lg object-cover border border-[#00A4EF]" />
                    <button 
                      type="button" 
                      onClick={() => setSchoolIdImage(null)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Personal Picture Optional */}
              <div className="space-y-2 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    Your Picture / Selfie <span className="text-zinc-400 font-normal">[OPTIONAL]</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => selfieInputRef.current?.click()}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg flex items-center gap-1 text-zinc-200"
                  >
                    <Upload size={14} /> Upload Selfie
                  </button>
                  <input 
                    ref={selfieInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, false)} 
                  />
                </div>

                {selfieImage && (
                  <div className="mt-2 relative inline-block">
                    <img src={selfieImage} alt="Selfie Preview" className="w-20 h-20 rounded-full object-cover border border-[#00A4EF]" />
                    <button 
                      type="button" 
                      onClick={() => setSelfieImage(null)}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2 bg-[#00A4EF] hover:bg-[#0090d4] text-xs font-semibold rounded-xl text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Verification Request'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
