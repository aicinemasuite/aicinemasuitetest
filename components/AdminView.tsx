import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';
import { ProjectInfo, Slide, Character, ShowcaseScene, Poster, VideoAsset, UserProfile } from '../types';
import { ProjectIO } from '../services/ProjectIO';

interface AdminViewProps {
  project: ProjectInfo;
  setProject: (project: ProjectInfo) => void;
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;
  onBack: () => void;
  user: UserProfile | null;
}

type AdminTab = 'DASHBOARD' | 'DATABASE' | 'SETTINGS' | 'SYSTEM';
type DbTab = 'SLIDES' | 'CHARACTERS' | 'SCENES' | 'POSTERS' | 'VIDEOS' | 'USERS';

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  project, 
  setProject, 
  slides, 
  setSlides, 
  onBack,
  user
}) => {
  const isSuperAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [activeDbTab, setActiveDbTab] = useState<DbTab>('SLIDES');

  // System Settings State (Simulated Backend)
  const [globalBanner, setGlobalBanner] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Social Links
  const [youtubeLink, setYoutubeLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  
  // Custom Dynamic Links
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);

  // Help & Support Content State
  const [contactAddress, setContactAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);

  useEffect(() => {
    // Load "Simulated Backend" settings from localStorage
    const banner = localStorage.getItem('cinepitch_global_banner');
    const maint = localStorage.getItem('cinepitch_maintenance');
    
    if (banner) setGlobalBanner(banner);
    if (maint) setMaintenanceMode(maint === 'true');

    // Load Social Links
    setYoutubeLink(localStorage.getItem('cinepitch_youtube_link') || "");
    setWhatsappLink(localStorage.getItem('cinepitch_whatsapp_link') || "");
    setFacebookLink(localStorage.getItem('cinepitch_social_facebook') || "");
    setTwitterLink(localStorage.getItem('cinepitch_social_twitter') || "");
    setInstagramLink(localStorage.getItem('cinepitch_social_instagram') || "");
    setLinkedinLink(localStorage.getItem('cinepitch_social_linkedin') || "");

    // Load Custom Links
    const savedCustomLinks = localStorage.getItem('cinepitch_custom_social_links');
    if (savedCustomLinks) {
       try {
          setCustomLinks(JSON.parse(savedCustomLinks));
       } catch (e) { console.error("Error loading custom links", e); }
    }

    // Load Help Content
    setContactAddress(localStorage.getItem('cinepitch_contact_address') || "2nd floor, Kalathil Buildings,\nAkampadam, Eranhimangad.P.O.,\nNilambur, Malappuram, Kerala - 679329");
    setContactEmail(localStorage.getItem('cinepitch_contact_email') || "aicinemasuite@gmail.com");
    setContactPhone(localStorage.getItem('cinepitch_contact_phone') || "9946704365");
    
    const savedFaqs = localStorage.getItem('cinepitch_faqs');
    if (savedFaqs) {
        try {
            setFaqs(JSON.parse(savedFaqs));
        } catch (e) { console.error("Failed to parse FAQs"); }
    } else {
        // Default FAQs if none saved
        setFaqs([
            { q: "How does the AI work?", a: "We use advanced Gemini models to analyze your script." },
            { q: "Is my script secure?", a: "Yes. Your script is processed securely in your browser session." }
        ]);
    }
  }, []);

  const saveSystemSettings = () => {
    // Save General
    localStorage.setItem('cinepitch_global_banner', globalBanner);
    localStorage.setItem('cinepitch_maintenance', String(maintenanceMode));
    
    // Save Social
    localStorage.setItem('cinepitch_youtube_link', youtubeLink);
    localStorage.setItem('cinepitch_whatsapp_link', whatsappLink);
    localStorage.setItem('cinepitch_social_facebook', facebookLink);
    localStorage.setItem('cinepitch_social_twitter', twitterLink);
    localStorage.setItem('cinepitch_social_instagram', instagramLink);
    localStorage.setItem('cinepitch_social_linkedin', linkedinLink);
    
    // Save Custom Links
    localStorage.setItem('cinepitch_custom_social_links', JSON.stringify(customLinks));
    
    // Save Help Content
    localStorage.setItem('cinepitch_contact_address', contactAddress);
    localStorage.setItem('cinepitch_contact_email', contactEmail);
    localStorage.setItem('cinepitch_contact_phone', contactPhone);
    localStorage.setItem('cinepitch_faqs', JSON.stringify(faqs));

    alert("System Settings & Social Links Saved Successfully!");
  };

  const handleAddCustomLink = () => {
     setCustomLinks([...customLinks, { id: `link-${Date.now()}`, label: "", url: "" }]);
  };

  const handleUpdateCustomLink = (index: number, field: 'label' | 'url', value: string) => {
     const updated = [...customLinks];
     updated[index][field] = value;
     setCustomLinks(updated);
  };

  const handleRemoveCustomLink = (index: number) => {
     const updated = [...customLinks];
     updated.splice(index, 1);
     setCustomLinks(updated);
  };

  const handleBackup = async () => {
     try {
        await ProjectIO.save(project, slides, null);
     } catch (e) {
        alert("Backup failed. See console.");
     }
  };

  const handleAddFaq = () => {
     setFaqs([...faqs, { q: "New Question?", a: "New Answer." }]);
  };

  const handleRemoveFaq = (index: number) => {
     const newFaqs = [...faqs];
     newFaqs.splice(index, 1);
     setFaqs(newFaqs);
  };

  const handleUpdateFaq = (index: number, field: 'q'|'a', value: string) => {
     const newFaqs = [...faqs];
     newFaqs[index][field] = value;
     setFaqs(newFaqs);
  };

  // ... (Database helper functions remain unchanged)
  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setProject({
      ...project,
      characters: project.characters?.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };
  const deleteCharacter = (id: string) => {
    setProject({ ...project, characters: project.characters?.filter(c => c.id !== id) });
  };

  const updateScene = (id: string, updates: Partial<ShowcaseScene>) => {
    setProject({
      ...project,
      showcaseScenes: project.showcaseScenes?.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const updatePoster = (id: string, updates: Partial<Poster>) => {
    setProject({
      ...project,
      posters: project.posters?.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };
  const deletePoster = (id: string) => {
    setProject({ ...project, posters: project.posters?.filter(p => p.id !== id) });
  };

  const updateVideo = (id: string, updates: Partial<VideoAsset>) => {
    setProject({
      ...project,
      videos: project.videos?.map(v => v.id === id ? { ...v, ...updates } : v)
    });
  };
  const deleteVideo = (id: string) => {
    setProject({ ...project, videos: project.videos?.filter(v => v.id !== id) });
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>, type: DbTab, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
          const result = reader.result as string;
          if (type === 'SLIDES') updateSlide(id, { imageUrl: result });
          if (type === 'CHARACTERS') updateCharacter(id, { imageUrl: result });
          if (type === 'SCENES') updateScene(id, { imageUrl: result });
          if (type === 'POSTERS') updatePoster(id, { imageUrl: result });
          if (type === 'VIDEOS') updateVideo(id, { url: result });
       };
       reader.readAsDataURL(file);
    }
  };

  const [mockUsers] = useState([
     { id: 1, name: "Noushadali", email: "director@studio.com", role: "ADMIN", credits: 999999, status: "Active" },
     { id: 2, name: "John Doe", email: "john@example.com", role: "EDITOR", credits: 500, status: "Active" },
     { id: 3, name: "Sarah Smith", email: "sarah@example.com", role: "VIEWER", credits: 0, status: "Inactive" },
     { id: 4, name: "Mike Ross", email: "mike.r@example.com", role: "EDITOR", credits: 120, status: "Active" },
  ]);

  // --- SUB-VIEWS ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><ICONS.Layout size={64}/></div>
             <h3 className="text-zinc-500 text-xs uppercase font-bold mb-2">Project Slides</h3>
             <p className="text-4xl font-bold text-white">{slides.length}</p>
             <button onClick={() => { setActiveTab('DATABASE'); setActiveDbTab('SLIDES'); }} className="text-amber-500 text-xs mt-4 flex items-center hover:underline">Manage Slides <ICONS.ArrowRight size={12} className="ml-1"/></button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><ICONS.Users size={64}/></div>
             <h3 className="text-zinc-500 text-xs uppercase font-bold mb-2">Cast & Characters</h3>
             <p className="text-4xl font-bold text-white">{project.characters?.length || 0}</p>
             <button onClick={() => { setActiveTab('DATABASE'); setActiveDbTab('CHARACTERS'); }} className="text-amber-500 text-xs mt-4 flex items-center hover:underline">Manage Cast <ICONS.ArrowRight size={12} className="ml-1"/></button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden">
             <div className="bg-red-600/20 text-red-500 absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold">LIVE</div>
             <h3 className="text-zinc-500 text-xs uppercase font-bold mb-2">Session Memory</h3>
             <p className="text-4xl font-bold text-white">{(JSON.stringify(project).length / 1024).toFixed(1)} KB</p>
             <p className="text-zinc-500 text-xs mt-4">Local Browser Storage</p>
          </div>
          {isSuperAdmin && (
             <div className="bg-gradient-to-br from-red-900/30 to-zinc-900 border border-red-900/50 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><ICONS.ShieldCheck size={64}/></div>
                <h3 className="text-red-400 text-xs uppercase font-bold mb-2">System Users</h3>
                <p className="text-4xl font-bold text-white">{mockUsers.length}</p>
                <button onClick={() => { setActiveTab('SYSTEM'); }} className="text-white text-xs mt-4 flex items-center hover:underline">Admin Panel <ICONS.ArrowRight size={12} className="ml-1"/></button>
             </div>
          )}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="secondary" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => { setActiveTab('DATABASE'); setActiveDbTab('SLIDES'); }}>
                   <ICONS.Plus size={24}/> <span>Add Slide</span>
                </Button>
                <Button variant="secondary" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => { setActiveTab('SETTINGS'); }}>
                   <ICONS.Settings size={24}/> <span>Metadata</span>
                </Button>
                {isSuperAdmin && (
                    <Button variant="secondary" className="h-24 flex flex-col items-center justify-center gap-2 border-red-900/50 bg-red-900/10 hover:bg-red-900/20 text-red-400" onClick={() => { setActiveTab('SYSTEM'); }}>
                       <ICONS.ShieldCheck size={24}/> <span>Sys Admin</span>
                    </Button>
                )}
                <Button variant="secondary" className="h-24 flex flex-col items-center justify-center gap-2" onClick={handleBackup}>
                   <ICONS.Save size={24}/> <span>Backup Data</span>
                </Button>
             </div>
          </div>
          {/* ... (Project Health section remains) ... */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-4">Project Health</h3>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs mb-1 text-zinc-400">
                      <span>Slide Content Completion</span>
                      <span>{Math.round((slides.filter(s => s.content.length > 50).length / slides.length) * 100)}%</span>
                   </div>
                   <div className="w-full bg-zinc-950 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{width: `${(slides.filter(s => s.content.length > 50).length / slides.length) * 100}%`}}></div></div>
                </div>
                <div>
                   <div className="flex justify-between text-xs mb-1 text-zinc-400">
                      <span>Asset Generation</span>
                      <span>{Math.round((slides.filter(s => s.imageUrl).length / slides.length) * 100)}%</span>
                   </div>
                   <div className="w-full bg-zinc-950 rounded-full h-2"><div className="bg-amber-600 h-2 rounded-full" style={{width: `${(slides.filter(s => s.imageUrl).length / slides.length) * 100}%`}}></div></div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderDatabase = () => {
    const renderTable = () => {
       switch(activeDbTab) {
          case 'SLIDES':
             return (
               <table className="w-full text-left border-collapse">
                 <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wider sticky top-0">
                    <tr>
                       <th className="p-4 w-16">#</th>
                       <th className="p-4 w-24">Visual</th>
                       <th className="p-4 w-1/4">Title (Editable)</th>
                       <th className="p-4">Content Preview (Editable)</th>
                       <th className="p-4 w-32 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                    {slides.map((item, idx) => (
                       <tr key={item.id} className="hover:bg-zinc-800/50 group">
                          <td className="p-4 text-zinc-500 font-mono">{idx + 1}</td>
                          <td className="p-4">
                             <div className="w-16 h-10 bg-zinc-900 rounded overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-amber-500">
                                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover"/> : <ICONS.Image className="m-auto mt-2 text-zinc-700"/>}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleAssetUpload(e, 'SLIDES', item.id)} />
                             </div>
                          </td>
                          <td className="p-4">
                             <input className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-amber-500 focus:bg-zinc-900 rounded p-1 outline-none transition-all" value={item.title} onChange={(e) => updateSlide(item.id, { title: e.target.value })} />
                          </td>
                          <td className="p-4">
                             <input className="w-full bg-transparent border border-transparent hover:border-zinc-700 focus:border-amber-500 focus:bg-zinc-900 rounded p-1 outline-none transition-all text-zinc-500" value={item.content.substring(0, 100)} onChange={(e) => updateSlide(item.id, { content: e.target.value })} />
                          </td>
                          <td className="p-4 text-right">
                             <button onClick={() => deleteSlide(item.id)} className="text-zinc-600 hover:text-red-500 p-2"><ICONS.Trash2 size={16}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
               </table>
             );
          case 'CHARACTERS':
             return (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4">
                  {project.characters?.map((c) => (
                     <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group relative">
                        <div className="aspect-square relative">
                           {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><ICONS.User size={32}/></div>}
                           <button onClick={() => deleteCharacter(c.id)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><ICONS.Trash2 size={12}/></button>
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleAssetUpload(e, 'CHARACTERS', c.id)} title="Upload Image"/>
                        </div>
                        <div className="p-2">
                           <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-white font-bold text-center" value={c.name} onChange={(e) => updateCharacter(c.id, { name: e.target.value })} />
                        </div>
                     </div>
                  ))}
               </div>
             );
          case 'POSTERS':
             return (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
                  {project.posters?.map((p) => (
                     <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group relative">
                        <div className="aspect-[2/3] relative">
                           {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><ICONS.Image size={32}/></div>}
                           <button onClick={() => deletePoster(p.id)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><ICONS.Trash2 size={12}/></button>
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleAssetUpload(e, 'POSTERS', p.id)} />
                        </div>
                        <div className="p-2">
                           <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-white font-bold text-center" value={p.title} onChange={(e) => updatePoster(p.id, { title: e.target.value })} />
                        </div>
                     </div>
                  ))}
               </div>
             );
          case 'VIDEOS':
             return (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                  {project.videos?.map((v) => (
                     <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group relative">
                        <div className="aspect-video relative bg-black">
                           <video src={v.url} className="w-full h-full object-cover opacity-50"/>
                           <button onClick={() => deleteVideo(v.id)} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"><ICONS.Trash2 size={12}/></button>
                           <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs pointer-events-none">{v.source}</div>
                        </div>
                        <div className="p-3">
                           <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-xs text-white font-bold" value={v.title} onChange={(e) => updateVideo(v.id, { title: e.target.value })} />
                           <p className="text-[10px] text-zinc-500 mt-1">{new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>
                  ))}
               </div>
             );
          default:
             return <div className="p-8 text-center text-zinc-500">Select a category</div>;
       }
    };

    return (
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[500px] flex flex-col animate-in fade-in duration-300">
          <div className="border-b border-zinc-800 flex bg-zinc-950 overflow-x-auto no-scrollbar">
             {['SLIDES', 'CHARACTERS', 'POSTERS', 'VIDEOS'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveDbTab(tab as DbTab)}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeDbTab === tab ? 'border-amber-500 text-white bg-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
               >
                   {tab}
                </button>
             ))}
          </div>
          <div className="flex-1 overflow-auto">
             {renderTable()}
          </div>
       </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ICONS.Settings size={20} className="text-zinc-400"/> General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Project Title</label>
                <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none" value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} />
             </div>
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Director / Creator</label>
                <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none" value={project.director} onChange={(e) => setProject({ ...project, director: e.target.value })} />
             </div>
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Genre</label>
                <input className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none" value={project.genre} onChange={(e) => setProject({ ...project, genre: e.target.value })} />
             </div>
             <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Language Mode</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none" value={project.language} onChange={(e) => setProject({ ...project, language: e.target.value as 'en'|'ml' })}>
                   <option value="en">English (International)</option>
                   <option value="ml">Malayalam (Regional)</option>
                </select>
             </div>
             <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Logline</label>
                <textarea className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none resize-none" value={project.logline} onChange={(e) => setProject({ ...project, logline: e.target.value })} />
             </div>
          </div>
       </div>
    </div>
  );

  const renderSystemAdmin = () => (
     <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl text-center">
            <h1 className="text-2xl font-bold text-red-500 uppercase tracking-widest mb-2">Super Admin Console</h1>
            <p className="text-zinc-400 text-sm">You are viewing the global system configuration. Changes here affect all users.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* GLOBAL ALERTS & SYSTEM STATUS */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ICONS.Zap className="text-amber-500" size={18}/> System Announcements
               </h3>
               <div className="space-y-4">
                  <div>
                     <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Banner Message</label>
                     <input 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white text-sm"
                        placeholder="e.g. System maintenance scheduled for 10 PM"
                        value={globalBanner}
                        onChange={(e) => setGlobalBanner(e.target.value)}
                     />
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                     <input 
                        type="checkbox" 
                        id="maintMode"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-800 border-zinc-700"
                     />
                     <label htmlFor="maintMode" className="text-sm text-zinc-300 cursor-pointer">Enable Maintenance Mode (Lock Access)</label>
                  </div>
               </div>
           </div>

           {/* SOCIAL MEDIA & LINKS MANAGER (NEW) */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ICONS.Globe className="text-blue-500" size={18}/> Social Media & Links
               </h3>
               <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Facebook</label>
                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" placeholder="https://facebook.com/..." value={facebookLink} onChange={(e) => setFacebookLink(e.target.value)}/>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">X (Twitter)</label>
                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" placeholder="https://x.com/..." value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)}/>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Instagram</label>
                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" placeholder="https://instagram.com/..." value={instagramLink} onChange={(e) => setInstagramLink(e.target.value)}/>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">LinkedIn</label>
                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" placeholder="https://linkedin.com/..." value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)}/>
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">YouTube Channel</label>
                     <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" placeholder="https://youtube.com/..." value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)}/>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">WhatsApp Group</label>
                     <input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" placeholder="https://chat.whatsapp.com/..." value={whatsappLink} onChange={(e) => setWhatsappLink(e.target.value)}/>
                  </div>

                  {/* DYNAMIC ADDITIONAL LINKS SECTION */}
                  <div className="pt-4 border-t border-zinc-800 mt-2">
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Additional Links</label>
                        <button onClick={handleAddCustomLink} className="text-xs flex items-center gap-1 text-amber-500 hover:text-amber-400">
                           <ICONS.Plus size={10}/> Add Item
                        </button>
                     </div>
                     <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {customLinks.map((link, idx) => (
                           <div key={link.id} className="flex gap-2 items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                              <div className="w-1/3">
                                 <input 
                                    className="w-full bg-transparent text-xs text-white placeholder-zinc-600 border-b border-zinc-800 focus:border-amber-500 outline-none pb-1"
                                    placeholder="Label (e.g. TikTok)"
                                    value={link.label}
                                    onChange={(e) => handleUpdateCustomLink(idx, 'label', e.target.value)}
                                 />
                              </div>
                              <div className="flex-1">
                                 <input 
                                    className="w-full bg-transparent text-xs text-zinc-400 placeholder-zinc-700 border-b border-zinc-800 focus:border-amber-500 outline-none pb-1"
                                    placeholder="https://..."
                                    value={link.url}
                                    onChange={(e) => handleUpdateCustomLink(idx, 'url', e.target.value)}
                                 />
                              </div>
                              <button onClick={() => handleRemoveCustomLink(idx)} className="text-zinc-600 hover:text-red-500">
                                 <ICONS.Trash2 size={12}/>
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
           </div>
        </div>

        {/* --- HELP & SUPPORT CONTENT SECTION --- */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ICONS.HelpCircle className="text-green-500" size={18}/> Help & Support Content
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CONTACT DETAILS */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase">Contact Information</h4>
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Office Address (Multiline)</label>
                        <textarea 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm h-24 resize-none"
                            value={contactAddress}
                            onChange={(e) => setContactAddress(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Email</label>
                            <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Phone / Whatsapp</label>
                            <input 
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ EDITOR */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase">FAQ Items</h4>
                        <button onClick={handleAddFaq} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded flex items-center gap-1">
                            <ICONS.Plus size={12}/> Add Item
                        </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-zinc-950 p-3 rounded border border-zinc-800 relative group">
                                <button onClick={() => handleRemoveFaq(idx)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ICONS.Trash2 size={12}/>
                                </button>
                                <input 
                                    className="w-full bg-transparent text-xs font-bold text-white mb-1 border-b border-zinc-800 focus:border-amber-500 outline-none pb-1"
                                    placeholder="Question..."
                                    value={faq.q}
                                    onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                                />
                                <textarea 
                                    className="w-full bg-transparent text-xs text-zinc-400 resize-none outline-none"
                                    placeholder="Answer..."
                                    rows={2}
                                    value={faq.a}
                                    onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <Button variant="accent" onClick={saveSystemSettings} className="px-8 py-3 font-bold text-lg">
                Publish Changes
            </Button>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors" title="Back to Studio">
             <ICONS.ChevronLeft size={20} />
           </button>
           <div>
              <h1 className="text-xl font-bold text-white tracking-wide cinematic-font">
                  {isSuperAdmin ? <span className="text-red-500">SYSTEM ADMIN</span> : 'PROJECT DASHBOARD'}
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {isSuperAdmin ? 'Master Control' : project.title}
              </p>
           </div>
        </div>
        <div className="flex gap-2">
           <span className="text-xs text-zinc-500 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> {isSuperAdmin ? 'Admin Mode' : 'User Mode'}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar */}
         <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col py-6 px-3 gap-1">
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'DASHBOARD' ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
            >
               <ICONS.Layout size={18}/> {isSuperAdmin ? 'Overview' : 'Project Stats'}
            </button>
            <button 
              onClick={() => setActiveTab('DATABASE')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'DATABASE' ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
            >
               <ICONS.Grid size={18}/> Content Manager
            </button>
            <button 
              onClick={() => setActiveTab('SETTINGS')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === 'SETTINGS' ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
            >
               <ICONS.Settings size={18}/> Settings
            </button>
            {isSuperAdmin && (
                <button 
                  onClick={() => setActiveTab('SYSTEM')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors mt-8 border border-red-900/30 ${activeTab === 'SYSTEM' ? 'bg-red-900/20 text-red-500' : 'text-red-800 hover:bg-red-900/10'}`}
                >
                   <ICONS.ShieldCheck size={18}/> System Admin
                </button>
            )}
         </aside>

         {/* Main Content */}
         <main className="flex-1 overflow-y-auto p-8 bg-black">
            {activeTab === 'DASHBOARD' && renderDashboard()}
            {activeTab === 'DATABASE' && renderDatabase()}
            {activeTab === 'SETTINGS' && renderSettings()}
            {activeTab === 'SYSTEM' && isSuperAdmin && renderSystemAdmin()}
         </main>
      </div>
    </div>
  );
};