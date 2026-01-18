import React, { useState, useRef } from 'react';
import { User } from '../types';
import { GoogleGenAI } from "@google/genai";
import { X, User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, Save, ShieldCheck, Upload, Smile, Bot, Sparkles, UserCircle2, Palette, Sword, Gamepad2, Star, Loader2, Wand2, MonitorPlay, Sticker, Grid } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

// Helper to generate DiceBear URLs with specific styles and background colors for a cleaner look
const generateAvatars = (style: string, seedPrefix: string, count: number, options = '') => {
  return Array.from({ length: count }, (_, i) => 
    `https://api.dicebear.com/7.x/${style}/svg?seed=${seedPrefix}${i}${options}`
  );
};

// Specific avatars requested by the user, mapped to DiceBear seeds that approximate the descriptions
const FEATURED_SEEDS = [
  'MaidBlackHair',
  'BlondeHorns',
  'PinkHair',
  'DarkHairCatEars',
  'BlueHairCatEars',
  'PurpleHairHorns',
  'WhiteHairAnimalEars',
  'BlondeWing'
];

const FEATURED_AVATARS = FEATURED_SEEDS.map(seed => 
  `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=10`
);

// Pre-defined sets for the Anime styles to save generation time
const ANIME_SETS = {
  POLISHED: Array.from({ length: 12 }, (_, i) => 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=Fantasy${i}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=10`
  ),
  RETRO: Array.from({ length: 12 }, (_, i) => 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=RetroMoon${i}&backgroundColor=ffdfbf,ffd5dc,f4c1c1&radius=10&scale=110`
  ),
  CHIBI: Array.from({ length: 12 }, (_, i) => 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=ChibiSD${i}&backgroundColor=c1f4c5,f4f1c1,e2e8f0&radius=10&scale=90&translateY=5`
  )
};

const AVATAR_CATEGORIES = {
  FEATURED: FEATURED_AVATARS,
  ANIME: [], // Placeholder, handled specifically in UI
  STICKERS: generateAvatars('fun-emoji', 'Sticker', 30, ''), // High resolution stickers
  // Using 'adventurer' for RPG/Fantasy look
  RPG: generateAvatars('adventurer', 'Quest', 24, '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=10'),
  // Using 'pixel-art'
  PIXEL: generateAvatars('pixel-art', 'Bit', 24, '&radius=10'),
  // Using 'notionists' for a modern clean look
  MODERN: generateAvatars('notionists', 'Sketch', 24, '&backgroundColor=e5e7eb,fecdd3,fde68a,bae6fd&radius=10'),
  // Standard Avataaars
  CARTOON: generateAvatars('avataaars', 'Toon', 24, '&radius=10'),
  // Robots
  BOTS: generateAvatars('bottts', 'Robo', 24, '&radius=10'),
};

const ANIME_STYLES_INFO = {
  POLISHED: {
    label: 'Modern Fantasy',
    icon: Sword,
    prompt: 'Modern Fantasy Anime with Semi-Realistic CG Shading, Game-Style Anime, Fantasy Digital Painting, subtle 3D-like shading, detailed textures, dynamic lighting, anime proportions, best quality, 8k, solid background'
  },
  RETRO: {
    label: 'Retro 90s',
    icon: Palette,
    prompt: 'Classic 90s anime avatar, Sailor Moon style, retro cel animation, soft film grain, pastel colors, thick line art, large shimmering eyes, vintage aesthetic, solid background'
  },
  CHIBI: {
    label: 'Chibi / SD',
    icon: Sticker,
    prompt: 'Chibi anime avatar, Super Deformed (SD) style, large head small body, kawaii, minimalist, flat colors, bold outlines, sticker art style, solid background'
  }
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [avatarCategory, setAvatarCategory] = useState<keyof typeof AVATAR_CATEGORIES>('FEATURED');
  const [animeSubTab, setAnimeSubTab] = useState<'POLISHED' | 'RETRO' | 'CHIBI'>('POLISHED');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Profile State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...user,
      name,
      email: email || undefined,
      phone: phone || undefined,
      avatar: avatar || undefined
    });
    alert("Profile updated successfully!"); 
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }
    // Simulate API call
    setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        alert("Password changed successfully!");
        onClose();
    }, 500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert("Image too large (Max 2MB)");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = async (customPrompt?: string) => {
    if (!process.env.API_KEY) {
        alert("API Key not found. Please configure process.env.API_KEY.");
        return;
    }
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = customPrompt || ANIME_STYLES_INFO[animeSubTab].prompt;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            }
        });
        
        let foundImage = false;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    setAvatar(`data:image/png;base64,${base64String}`);
                    foundImage = true;
                    break;
                }
            }
        }
        
        if (!foundImage) {
            alert("AI generation completed but no image was returned. Please try again.");
        }
    } catch (error) {
        console.error("Generation failed", error);
        alert("Failed to generate avatar. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const isImage = (str?: string) => str?.startsWith('data:image') || str?.startsWith('http');

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'FEATURED': return <Star size={16} />;
      case 'STICKERS': return <Sticker size={16} />;
      case 'ANIME': return <Sparkles size={16} />;
      case 'RPG': return <Sword size={16} />;
      case 'PIXEL': return <Gamepad2 size={16} />;
      case 'MODERN': return <UserCircle2 size={16} />;
      case 'CARTOON': return <Palette size={16} />;
      case 'BOTS': return <Bot size={16} />;
      default: return <Smile size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
       <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh] border border-slate-200 dark:border-slate-800">
          
          {/* Sidebar */}
          <div className="w-full md:w-1/4 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-2 overflow-y-auto">
             <div className="flex flex-col items-center mb-6 text-center">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl shadow-lg border-4 border-white dark:border-slate-700 mb-3 overflow-hidden bg-white dark:bg-slate-800 relative">
                   {isGenerating ? (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-sm">
                         <Loader2 size={32} className="animate-spin text-white" />
                      </div>
                   ) : null}
                   {isImage(user.avatar) ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                      user.avatar || user.name[0]?.toUpperCase()
                   )}
                </div>
                <div className="min-w-0 w-full">
                   <div className="font-bold text-slate-800 dark:text-white truncate px-2 text-lg">{name}</div>
                   <div className="text-xs text-slate-500 dark:text-slate-400">Member since 2024</div>
                </div>
             </div>
             
             <div className="space-y-1">
               <button 
                 onClick={() => setActiveTab('profile')}
                 className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
               >
                 <UserIcon size={18} /> Edit Profile
               </button>
               <button 
                 onClick={() => setActiveTab('security')}
                 className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
               >
                 <ShieldCheck size={18} /> Security
               </button>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 relative overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
             <button onClick={onClose} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 z-10">
               <X size={20} />
             </button>

             {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-2xl">
                   <div>
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Edit Profile</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Update your photo and personal details.</p>
                   </div>
                   
                   {/* Avatar Selection Section */}
                   <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">Profile Avatar</label>
                      
                      <div className="flex flex-col gap-6">
                         {/* Preview & Upload */}
                         <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0 relative group shadow-sm">
                               {isGenerating && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-[1px]">
                                     <Loader2 size={24} className="animate-spin text-white" />
                                  </div>
                               )}
                               {isImage(avatar) ? (
                                 <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                 avatar || name[0]?.toUpperCase()
                               )}
                            </div>
                            <div className="flex-1">
                               <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Custom Image</h4>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Upload or generate a unique avatar.</p>
                               <div className="flex flex-wrap gap-2">
                                  <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
                                  >
                                    <Upload size={16} /> Upload
                                  </button>
                                  {avatar && (
                                     <button 
                                      type="button" 
                                      onClick={() => setAvatar('')}
                                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                                     >
                                       Remove
                                     </button>
                                  )}
                                  <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                  />
                               </div>
                            </div>
                         </div>

                         {/* Avatar Gallery */}
                         <div className="space-y-3">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                               {Object.keys(AVATAR_CATEGORIES).map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setAvatarCategory(cat as keyof typeof AVATAR_CATEGORIES)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                                      avatarCategory === cat 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {getCategoryIcon(cat)} {cat}
                                  </button>
                               ))}
                            </div>

                            {/* Sub-tabs for Anime Styles */}
                            {avatarCategory === 'ANIME' && (
                               <div className="flex gap-2 pb-2">
                                  {(Object.keys(ANIME_SETS) as Array<keyof typeof ANIME_SETS>).map((style) => {
                                      const StyleIcon = ANIME_STYLES_INFO[style].icon;
                                      return (
                                        <button
                                          key={style}
                                          type="button"
                                          onClick={() => setAnimeSubTab(style)}
                                          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                                            animeSubTab === style
                                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                          }`}
                                        >
                                          <StyleIcon size={12} />
                                          {ANIME_STYLES_INFO[style].label}
                                        </button>
                                      );
                                  })}
                               </div>
                            )}

                            <div className={`p-2 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-64 overflow-y-auto`}>
                               {avatarCategory === 'ANIME' ? (
                                  // Anime Section Logic with Pre-sets and AI Option
                                  <>
                                     {ANIME_SETS[animeSubTab].map((av, i) => (
                                       <button
                                         key={i}
                                         type="button"
                                         onClick={() => setAvatar(av)}
                                         className={`aspect-square flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:scale-105 transition-all overflow-hidden ${
                                           avatar === av ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                         }`}
                                         title="Select Avatar"
                                       >
                                          <img src={av} alt="Anime option" className="w-full h-full object-cover" loading="lazy" />
                                       </button>
                                     ))}
                                     
                                     {/* AI Generate Button as the last option in the grid */}
                                     <button
                                       type="button"
                                       onClick={() => handleGenerateAvatar()}
                                       disabled={isGenerating}
                                       className="aspect-square flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:scale-105 transition-all overflow-hidden p-1 gap-1"
                                       title="Generate Custom with AI"
                                     >
                                        {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                                        <span className="text-[10px] font-bold leading-tight text-center">Create Custom</span>
                                     </button>
                                  </>
                               ) : (
                                 AVATAR_CATEGORIES[avatarCategory].map((av, i) => (
                                   <button
                                     key={i}
                                     type="button"
                                     onClick={() => setAvatar(av)}
                                     className={`aspect-square flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border shadow-sm hover:scale-105 transition-all overflow-hidden ${
                                       avatar === av ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                     }`}
                                     title="Select Avatar"
                                   >
                                     {isImage(av) ? (
                                        <img src={av} alt="Avatar option" className="w-full h-full object-cover" loading="lazy" />
                                     ) : (
                                        <span className="text-2xl">{av}</span>
                                     )}
                                   </button>
                                 ))
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   <hr className="border-slate-100 dark:border-slate-800" />

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                        <div className="relative">
                           <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                             type="text" 
                             value={name}
                             onChange={e => setName(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                           <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                             type="email" 
                             value={email}
                             onChange={e => setEmail(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                        <div className="relative">
                           <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                             type="tel" 
                             value={phone}
                             onChange={e => setPhone(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                           />
                        </div>
                     </div>
                   </div>

                   <div className="pt-4 flex justify-end">
                      <button type="submit" className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 transform transition-transform active:scale-95">
                        <Save size={18} /> Save Changes
                      </button>
                   </div>
                </form>
             )}

             {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 max-w-lg">
                   <div>
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Change Password</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm">Ensure your account is using a long, random password to stay secure.</p>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type={showOldPass ? "text" : "password"}
                              value={oldPassword}
                              onChange={e => setOldPassword(e.target.value)}
                              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                              placeholder="Enter old password"
                            />
                            <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                          <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type={showNewPass ? "text" : "password"}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                              placeholder="Enter new password"
                            />
                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">Must be at least 6 characters long.</p>
                      </div>
                   </div>

                   <div className="pt-6">
                      <button type="submit" className="w-full md:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center justify-center gap-2 transform transition-transform active:scale-95">
                        <Save size={18} /> Update Password
                      </button>
                   </div>
                </form>
             )}
          </div>
       </div>
    </div>
  );
};