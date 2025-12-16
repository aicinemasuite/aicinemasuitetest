import React, { useRef, useState, useEffect } from 'react';
import { ICONS, DICTIONARY, PROJECT_CATEGORIES, GENRES_BY_CATEGORY } from '../constants';
import { ProjectInfo, ProjectType, ServiceType, StudioTab } from '../types';
import { Button } from './Button';

interface SetupViewProps {
  project: ProjectInfo;
  setProject: (project: ProjectInfo) => void;
  onStart: (initialTab: StudioTab) => void;
  onResume?: () => void;
  onLoadFromFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasSavedProject?: boolean;
  step: 'SERVICES' | 'CATEGORY' | 'DETAILS';
  setStep: (step: 'SERVICES' | 'CATEGORY' | 'DETAILS') => void;
  onReset?: () => void;
}

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

export const SetupView: React.FC<SetupViewProps> = ({ 
  project, 
  setProject, 
  onStart, 
  onResume, 
  onLoadFromFile, 
  hasSavedProject, 
  onReset 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectLoadRef = useRef<HTMLInputElement>(null);
  const t = DICTIONARY[project.language];
  const [activeCategory, setActiveCategory] = useState<ProjectType>(ProjectType.FEATURE_FILM);
  
  // Social Links
  const [socialLinks, setSocialLinks] = useState<{
    fb?: string;
    x?: string;
    insta?: string;
    yt?: string;
    linkedin?: string;
  }>({});
  
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  useEffect(() => {
    setSocialLinks({
      fb: localStorage.getItem('cinepitch_social_facebook') || "",
      x: localStorage.getItem('cinepitch_social_twitter') || "",
      insta: localStorage.getItem('cinepitch_social_instagram') || "",
      yt: localStorage.getItem('cinepitch_youtube_link') || "",
      linkedin: localStorage.getItem('cinepitch_social_linkedin') || ""
    });

    const savedCustom = localStorage.getItem('cinepitch_custom_social_links');
    if (savedCustom) {
       try {
          setCustomLinks(JSON.parse(savedCustom));
       } catch (e) { console.error("Error loading custom links", e); }
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setProject({ ...project, fullScript: text });
      };
      reader.readAsText(file);
    }
  };

  const handleCategoryChange = (type: ProjectType) => {
    setActiveCategory(type);
    setProject({ ...project, projectType: type, genre: '' });
  };

  const handleLaunch = () => {
    setProject({ ...project, serviceType: ServiceType.PITCH_DECK });
    onStart('DECK');
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setProject({
        ...project,
        title: "",
        genre: "",
        logline: "",
        director: "",
        fullScript: "",
        projectType: ProjectType.FEATURE_FILM,
        serviceType: ServiceType.PITCH_DECK,
        showcaseScenes: [],
        characters: [],
        posters: [],
        audioAssets: [],
        videos: [],
        locations: []
      });
    }
    setActiveCategory(ProjectType.FEATURE_FILM);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const availableGenres = GENRES_BY_CATEGORY[activeCategory] || [];
  const hasAnySocialLink = Object.values(socialLinks).some((link) => typeof link === 'string' && link.length > 0) || customLinks.length > 0;

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Global Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white">
         <ICONS.Clapperboard size={24} className="text-amber-500" />
         <div className="font-bold cinematic-font tracking-widest text-lg flex items-center">
           <span>AICINEMASUITE</span>
           <span className="text-amber-500">.COM</span>
         </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[900px]">
        
        {/* LEFT SIDEBAR: ACTIONS */}
        <div className="w-full md:w-64 bg-zinc-900/50 border-r border-zinc-800 p-6 flex flex-col gap-4 shrink-0">
           <div className="mb-6">
              <button 
                onClick={handleReset} 
                className="group flex items-center gap-2 hover:bg-zinc-800/50 -ml-2 px-2 py-1 rounded transition-colors w-full text-left"
                title="Click to reset form"
              >
                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">New Project</h2>
                <ICONS.RotateCcw size={16} className="text-zinc-500 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
              <p className="text-xs text-zinc-500">Enter details to initialize your creative studio session.</p>
           </div>
           
           <div className="mt-auto space-y-3">
              {hasSavedProject && onResume && (
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                   <h4 className="text-xs font-bold text-zinc-400 mb-2">Previous Session</h4>
                   <Button variant="secondary" onClick={onResume} className="w-full text-xs justify-start">
                     <ICONS.Play size={14} className="mr-2 text-green-500"/> Resume Last
                   </Button>
                </div>
              )}
              
              {onLoadFromFile && (
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                   <h4 className="text-xs font-bold text-zinc-400 mb-2">Load From File</h4>
                   <input 
                     type="file" 
                     ref={projectLoadRef}
                     className="hidden"
                     accept=".cinepitch,.json"
                     onChange={onLoadFromFile}
                   />
                   <Button variant="secondary" onClick={() => projectLoadRef.current?.click()} className="w-full text-xs justify-start">
                      <ICONS.Upload size={14} className="mr-2 text-blue-500"/> Open .cinepitch
                   </Button>
                </div>
              )}

              {/* SOCIAL ICONS SIDEBAR */}
              {hasAnySocialLink && (
                 <div className="pt-4 mt-2 border-t border-zinc-800 flex justify-center gap-3 flex-wrap">
                    {socialLinks.fb && (
                       <a href={socialLinks.fb} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-500 transition-colors p-1" title="Facebook">
                          <ICONS.Facebook size={16} />
                       </a>
                    )}
                    {socialLinks.x && (
                       <a href={socialLinks.x} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors p-1" title="X (Twitter)">
                          <ICONS.Twitter size={16} />
                       </a>
                    )}
                    {socialLinks.insta && (
                       <a href={socialLinks.insta} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-pink-500 transition-colors p-1" title="Instagram">
                          <ICONS.Instagram size={16} />
                       </a>
                    )}
                    {socialLinks.yt && (
                       <a href={socialLinks.yt} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-red-600 transition-colors p-1" title="YouTube">
                          <ICONS.Youtube size={16} />
                       </a>
                    )}
                    {socialLinks.linkedin && (
                       <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors p-1" title="LinkedIn">
                          <ICONS.Linkedin size={16} />
                       </a>
                    )}
                    {customLinks.map((link) => (
                       <a 
                         key={link.id} 
                         href={link.url} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="text-zinc-500 hover:text-amber-500 transition-colors p-1" 
                         title={link.label}
                       >
                          <ICONS.Globe size={16} />
                       </a>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* RIGHT CONTENT: FORM */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/50">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              
              {/* COLUMN 1: METADATA */}
              <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">1</span>
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Project Metadata</h3>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t.movieTitle}</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-zinc-700"
                      placeholder="e.g. The Last Horizon"
                      value={project.title}
                      onChange={(e) => setProject({...project, title: e.target.value})}
                      autoFocus
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Project Category</label>
                    <div className="grid grid-cols-2 gap-2">
                       {PROJECT_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${project.projectType === cat.id ? 'bg-amber-600/20 border-amber-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                          >
                             <cat.icon size={18} />
                             <span className="text-xs font-bold">{cat.label}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t.genre}</label>
                       <select
                         className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none appearance-none text-sm"
                         value={project.genre}
                         onChange={(e) => setProject({...project, genre: e.target.value})}
                       >
                         <option value="" disabled>Select Genre...</option>
                         {availableGenres.map(g => (
                           <option key={g} value={g}>{g}</option>
                         ))}
                         <option value="Other">Other / Mixed</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Language</label>
                       <select 
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none appearance-none text-sm"
                          value={project.language} 
                          onChange={(e) => setProject({...project, language: e.target.value as 'en'|'ml' })}
                       >
                          <option value="en">English (International)</option>
                          <option value="ml">Malayalam (Regional)</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t.director}</label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-zinc-700"
                      placeholder="Creator Name"
                      value={project.director}
                      onChange={(e) => setProject({...project, director: e.target.value})}
                    />
                 </div>
              </div>

              {/* COLUMN 2: STORY CONTENT */}
              <div className="space-y-6 flex flex-col">
                 <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">2</span>
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Story Content</h3>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t.logline}</label>
                    <textarea 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-zinc-700 h-24 resize-none"
                      placeholder="A one-sentence summary of your story..."
                      value={project.logline}
                      onChange={(e) => setProject({...project, logline: e.target.value})}
                    />
                 </div>

                 <div className="flex-1 flex flex-col">
                     <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-zinc-500 uppercase">{t.fullScript} (Optional)</label>
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800"
                       >
                         <ICONS.Upload size={12}/> {t.uploadScript} (.txt)
                       </button>
                     </div>
                     
                     <div className="bg-red-900/10 border border-red-900/40 rounded-lg p-3 mb-3 flex gap-3">
                        <div className="p-2 bg-red-900/20 rounded-full h-fit shrink-0">
                            <ICONS.ShieldCheck size={16} className="text-red-500" />
                        </div>
                        <div>
                            <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">100% Safe & Private</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                Your script is processed <strong>locally in your browser session</strong> for AI analysis only. We do not store, copy, or share your story. Your intellectual property remains strictly yours.
                            </p>
                        </div>
                     </div>

                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept=".txt,.md"
                       onChange={handleFileUpload}
                     />
                     <textarea 
                        className="w-full flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 focus:ring-1 focus:ring-blue-500 outline-none resize-none text-xs font-mono min-h-[200px]"
                        placeholder="Paste your full script, treatment, or notes here. This context helps the AI generate accurate slides, characters, and scenes."
                        value={project.fullScript}
                        onChange={(e) => setProject({...project, fullScript: e.target.value})}
                     />
                 </div>

                 <div className="pt-4 border-t border-zinc-800">
                    <Button 
                      className="w-full py-4 text-lg font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20"
                      onClick={handleLaunch}
                      disabled={!project.title || !project.genre}
                      icon={<ICONS.Rocket size={20} />}
                    >
                      Launch Studio Workspace
                    </Button>
                    <p className="text-[10px] text-zinc-600 text-center mt-3">
                       By launching, you accept that AI content is generated based on your inputs.
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};