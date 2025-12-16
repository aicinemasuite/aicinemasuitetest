
import React, { useState, useEffect } from 'react';
import { ICONS, PLACEHOLDER_IMAGE, DICTIONARY, DIRECTOR_STYLES, VISUAL_STYLES, CHARACTER_STYLES, ROLE_TYPES, BODY_TYPES, EXPRESSIONS, SHOT_SIZES, CAMERA_ANGLES, LENS_TYPES, STORYBOARD_STYLES, VOICE_OPTIONS, POSTER_COMPOSITIONS, COLOR_PALETTES } from '../constants';
import { Slide, ProjectInfo, ShowcaseScene, StudioTab, Character, Poster, AudioAsset, VideoAsset, LocationAsset, UserProfile, CastMember, CrewMember, VaultItem, VaultItemType, ScriptBeat, TwistOption, BudgetLineItem } from '../types';
import { Button } from './Button';
import { SlideThumbnail } from './SlideThumbnail';
import { generateVideoTrailer, generateVisualPrompt, generateSlideImage, generateStoryboardImage, generateCharacterImage, generateVoiceOver, findLocations, generateLocationImage, generatePosterPrompt, generatePosterImage, refineScript, generateScriptRoadmap, generateTwistIdeas, generateBudgetEstimate } from '../services/geminiService';

interface StudioViewProps {
  project: ProjectInfo;
  slides: Slide[];
  activeSlideId: string | null;
  setActiveSlideId: (id: string) => void;
  onUpdateSlide: (id: string, updates: Partial<Slide>) => void;
  onAddSlide: () => void;
  onPresentationMode: (type?: 'DECK' | 'STORYBOARD') => void;
  onStructureMode: () => void;
  onGoHome: () => void;
  // Drag
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  // AI Actions
  onGenerateContent: () => void;
  isGeneratingContent: boolean;
  onAutoPrompt: (style?: string) => void;
  isGeneratingPrompt: boolean;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Story Board
  showcaseScenes: ShowcaseScene[];
  onGenerateNextScene: () => void;
  isGeneratingScene: boolean;
  onUpdateScene: (id: string, updates: Partial<ShowcaseScene>) => void; 
  // Characters & Posters & Audio
  onAddCharacter: (char: Character) => void;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
  onAddPoster: (poster: Poster) => void;
  onUpdatePoster: (id: string, updates: Partial<Poster>) => void;
  onAddAudio: (audio: AudioAsset) => void;
  onAddVideo: (video: VideoAsset) => void;
  onDeleteVideo?: (id: string) => void;
  initialTab?: StudioTab;
  onTabChange?: (tab: StudioTab) => void;
  onSave?: () => void;
  onExport?: () => void;
  // Nav
  onOpenProfile?: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
  onOpenFAQ?: () => void;
  currentUser?: UserProfile | null;
  onUpdateProject?: (updates: Partial<ProjectInfo>) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  project,
  slides,
  activeSlideId,
  setActiveSlideId,
  onUpdateSlide,
  onAddSlide,
  onPresentationMode,
  onStructureMode,
  onGoHome,
  onDragStart,
  onDragOver,
  onDrop,
  onGenerateContent,
  isGeneratingContent,
  onAutoPrompt,
  isGeneratingPrompt,
  onGenerateImage,
  isGeneratingImage,
  onFileUpload,
  showcaseScenes,
  onGenerateNextScene,
  isGeneratingScene,
  onUpdateScene,
  onAddCharacter,
  onUpdateCharacter,
  onAddPoster,
  onUpdatePoster,
  onAddAudio,
  onAddVideo,
  onDeleteVideo,
  initialTab = 'DECK',
  onTabChange,
  onSave,
  onExport,
  onOpenProfile,
  onOpenAdmin,
  onLogout,
  onOpenFAQ,
  currentUser,
  onUpdateProject
}) => {
  const t = DICTIONARY[project.language];
  const slide = slides.find(s => s.id === activeSlideId);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoAsset | null>(null);

  const [isAssetGenerating, setIsAssetGenerating] = useState(false);

  // Audio State
  const [audioText, setAudioText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Poster State
  const [posterComposition, setPosterComposition] = useState("");
  const [posterPalette, setPosterPalette] = useState("");
  const [posterStyleRef, setPosterStyleRef] = useState<string | null>(null);

  // Script Magic State
  const [scriptConcept, setScriptConcept] = useState(project.storyConcept || "");
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [twistOptions, setTwistOptions] = useState<TwistOption[]>([]);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isGeneratingTwist, setIsGeneratingTwist] = useState(false);

  // Location Scout State
  const [locationQuery, setLocationQuery] = useState("");
  const [locationRegion, setLocationRegion] = useState("India");
  const [scoutedLocations, setScoutedLocations] = useState<LocationAsset[]>([]);
  const [isScouting, setIsScouting] = useState(false);

  // Vault State
  const [vaultFilter, setVaultFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'DOCS'>('ALL');
  const [editingVaultItem, setEditingVaultItem] = useState<VaultItem | null>(null);

  // Budget State
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [budgetScale, setBudgetScale] = useState<'Micro/Indie'|'Mid-Range'|'Blockbuster'>(project.budgetScale || 'Mid-Range');
  const [budgetCurrency, setBudgetCurrency] = useState<'INR'|'USD'>(project.budgetCurrency || 'INR');

  // User Menu State
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: StudioTab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(e.target.value);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newVideo: VideoAsset = {
        id: `vid-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        url: url,
        createdAt: Date.now(),
        source: 'UPLOAD'
      };
      onAddVideo(newVideo);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    setIsGeneratingVideo(true);
    try {
      const url = await generateVideoTrailer(videoPrompt);
      if (url) {
        const newVideo: VideoAsset = {
          id: `vid-ai-${Date.now()}`,
          title: `AI Generated: ${videoPrompt.substring(0, 20)}...`,
          url: url,
          createdAt: Date.now(),
          source: 'AI'
        };
        onAddVideo(newVideo);
      }
    } catch (e) {
      console.error("Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // --- SCRIPT MAGIC LOGIC ---
  const handleGenerateRoadmap = async () => {
    if (!scriptConcept || !onUpdateProject) return;
    setIsGeneratingRoadmap(true);
    try {
      // Save concept
      onUpdateProject({ storyConcept: scriptConcept });
      
      const beats = await generateScriptRoadmap(scriptConcept, project.language);
      if (beats.length > 0) {
        onUpdateProject({ scriptRoadmap: beats });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleBeatClick = async (beat: ScriptBeat) => {
    setActiveBeatId(beat.id);
    setTwistOptions([]); // Clear previous
    setIsGeneratingTwist(true);
    
    try {
      const twists = await generateTwistIdeas(
        scriptConcept,
        beat.title,
        beat.aiSuggestion || "",
        project.language
      );
      setTwistOptions(twists);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTwist(false);
    }
  };

  const handleApplyTwist = (content: string) => {
    if (!onUpdateProject) return;
    // Append to full script
    const newScript = (project.fullScript || "") + "\n\n" + content;
    onUpdateProject({ fullScript: newScript });
    setTwistOptions([]); // Close deck
    setActiveBeatId(null);
  };

  // --- BUDGET FORGE LOGIC ---
  const handleGenerateBudget = async () => {
     if (!onUpdateProject) return;
     setIsGeneratingBudget(true);
     try {
       const items = await generateBudgetEstimate(project, budgetScale, budgetCurrency);
       onUpdateProject({
          budgetItems: items,
          budgetScale: budgetScale,
          budgetCurrency: budgetCurrency
       });
     } catch (e) {
       console.error(e);
     } finally {
       setIsGeneratingBudget(false);
     }
  };

  const handleDownloadBudgetCSV = () => {
    if (!project.budgetItems || project.budgetItems.length === 0) return;
    
    const headers = ["Category", "Line Item", "Notes", `Cost (${budgetCurrency})`];
    const rows = project.budgetItems.map(item => [
      `"${item.category}"`,
      `"${item.item}"`,
      `"${item.notes || ''}"`,
      `${item.cost}`
    ]);
    
    // Add Total Row
    rows.push(["TOTAL", "", "", `${getTotalBudget()}`]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.title.replace(/\s+/g, '_')}_Budget.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMoney = (amount: number) => {
     if (budgetCurrency === 'USD') return `$${amount.toLocaleString()}`;
     // INR formatting (Lakhs/Crores helper could be added, but simple locale is fine)
     return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getTotalBudget = () => {
     return project.budgetItems?.reduce((acc, item) => acc + item.cost, 0) || 0;
  };

  // --- ASSET HANDLERS ---
  const handleCharacterRefUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'FACE' | 'ACTION') => {
    const file = e.target.files?.[0];
    if (file && activeCharacter) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'FACE') {
          onUpdateCharacter(activeCharacter.id, { referenceImageUrl: reader.result as string });
        } else {
          onUpdateCharacter(activeCharacter.id, { actionReferenceImageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePosterRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePoster) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdatePoster(activePoster.id, { referenceImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoryboardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSceneId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateScene(activeSceneId, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAssetImage = async (prompt: string, type: 'CHARACTER' | 'POSTER', id: string, aspectRatio?: '16:9' | '1:1' | '2:3') => {
    setIsAssetGenerating(true);
    try {
      if (type === 'CHARACTER') {
        const char = project.characters?.find(c => c.id === id);
        if (char) {
          const url = await generateCharacterImage(char, prompt);
          if (url) onUpdateCharacter(id, { imageUrl: url });
        }
      } else {
        const poster = project.posters?.find(p => p.id === id);
        if (poster) {
           const url = await generatePosterImage(poster, project);
           if (url) onUpdatePoster(id, { imageUrl: url });
        } else {
           const url = await generateSlideImage(prompt, aspectRatio || '2:3');
           if (url) onUpdatePoster(id, { imageUrl: url });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssetGenerating(false);
    }
  };

  const handlePolishScenePrompt = async () => {
    if (!activeSceneId) return;
    const scene = showcaseScenes.find(s => s.id === activeSceneId);
    if (!scene) return;

    setIsAssetGenerating(true);
    try {
        const prompt = await generateVisualPrompt(project, "Scene Visuals", scene.visualPrompt || scene.action, scene.imageStyle);
        onUpdateScene(scene.id, { visualPrompt: prompt });
    } catch (e) {
        console.error(e);
    } finally {
        setIsAssetGenerating(false);
    }
  };

  const handleAutoPosterPrompt = async () => {
    if (!activePoster) return;
    setIsAssetGenerating(true);
    try {
      const prompt = await generatePosterPrompt(project);
      onUpdatePoster(activePoster.id, { prompt });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssetGenerating(false);
    }
  };

  const handleGenerateStoryboardShot = async () => {
    if (!activeSceneId) return;
    const scene = showcaseScenes.find(s => s.id === activeSceneId);
    if (!scene) return;

    setIsAssetGenerating(true);
    try {
      const url = await generateStoryboardImage(project, scene);
      if (url) {
         const newVariants = [url, ...(scene.generatedVariants || [])].slice(0, 10);
         onUpdateScene(scene.id, { imageUrl: url, generatedVariants: newVariants });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssetGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioText) return;
    setIsGeneratingAudio(true);
    try {
      const url = await generateVoiceOver(audioText, selectedVoice);
      if (url) {
        onAddAudio({
          id: `audio-${Date.now()}`,
          text: audioText,
          voice: selectedVoice,
          audioUrl: url,
          createdAt: Date.now()
        });
        setAudioText(""); // Clear input
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleFindLocations = async () => {
    if (!locationQuery) return;
    setIsScouting(true);
    try {
      const results = await findLocations(project, locationQuery, locationRegion);
      setScoutedLocations(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScouting(false);
    }
  };

  const handleVisualizeLocation = async (loc: LocationAsset) => {
    setIsScouting(true);
    const url = await generateLocationImage(loc, locationQuery);
    if (url) {
      setScoutedLocations(prev => prev.map(l => l.id === loc.id ? { ...l, imageUrl: url } : l));
    }
    setIsScouting(false);
  };

  const createNewCharacter = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: "New Character",
      role: "Character",
      roleType: 'Supporting',
      description: "",
      gender: "",
      age: "",
      skinTone: "",
      hairStyle: "",
      clothing: "",
      accessories: "",
      nationality: "",
      era: "",
      faceShape: "",
      skinTexture: "",
      bodyType: "",
      expression: "",
      eyeGaze: "",
      aspectRatio: '1:1',
      visualPrompt: "",
      imageUrl: null,
      referenceImageUrl: null,
      actionReferenceImageUrl: null
    };
    onAddCharacter(newChar);
    setActiveAssetId(newChar.id);
  };

  const createNewPoster = () => {
    const newPoster: Poster = {
      id: `poster-${Date.now()}`,
      title: project.title || "Movie Title",
      tagline: "The tagline goes here.",
      style: "Cinematic",
      aspectRatio: '2:3',
      prompt: "",
      imageUrl: null
    };
    onAddPoster(newPoster);
    setActiveAssetId(newPoster.id);
  };

  // --- CAST & CREW HANDLERS ---
  const handleAddCastMember = () => {
    if (!onUpdateProject) return;
    const newMember: CastMember = {
      id: `cast-${Date.now()}`,
      characterName: "New Character",
      characterImage: null,
      actorName: "",
      actorImage: null
    };
    onUpdateProject({
      castList: [...(project.castList || []), newMember]
    });
  };

  const handleUpdateCastMember = (id: string, updates: Partial<CastMember>) => {
    if (!onUpdateProject || !project.castList) return;
    const updatedList = project.castList.map(c => c.id === id ? { ...c, ...updates } : c);
    onUpdateProject({ castList: updatedList });
  };

  const handleDeleteCastMember = (id: string) => {
    if (!onUpdateProject || !project.castList) return;
    const updatedList = project.castList.filter(c => c.id !== id);
    onUpdateProject({ castList: updatedList });
  };

  const handleCastImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, field: 'characterImage' | 'actorImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateCastMember(id, { [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCrewMember = () => {
    if (!onUpdateProject) return;
    const newMember: CrewMember = {
      id: `crew-${Date.now()}`,
      role: "",
      name: ""
    };
    onUpdateProject({
      crewList: [...(project.crewList || []), newMember]
    });
  };

  const handleUpdateCrewMember = (id: string, updates: Partial<CrewMember>) => {
    if (!onUpdateProject || !project.crewList) return;
    const updatedList = project.crewList.map(c => c.id === id ? { ...c, ...updates } : c);
    onUpdateProject({ crewList: updatedList });
  };

  const handleDeleteCrewMember = (id: string) => {
    if (!onUpdateProject || !project.crewList) return;
    const updatedList = project.crewList.filter(c => c.id !== id);
    onUpdateProject({ crewList: updatedList });
  };

  // --- VAULT HANDLERS ---
  const handleVaultUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onUpdateProject) {
      const newItems: VaultItem[] = [];
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let type: VaultItemType = 'UNKNOWN';
          if (file.type.startsWith('image/')) type = 'IMAGE';
          else if (file.type.startsWith('video/')) type = 'VIDEO';
          else if (file.type === 'application/pdf') type = 'PDF';
          else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) type = 'TEXT';
          else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) type = 'ARCHIVE';
          else if (file.type.startsWith('audio/')) type = 'AUDIO';

          const newItem: VaultItem = {
            id: `vault-${Date.now()}-${Math.random()}`,
            type,
            title: file.name,
            description: "",
            url: reader.result as string,
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            createdAt: Date.now()
          };
          
          onUpdateProject({ 
             vaultItems: [...(project.vaultItems || []), newItem] 
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateVaultItem = (id: string, updates: Partial<VaultItem>) => {
    if (!onUpdateProject || !project.vaultItems) return;
    const updated = project.vaultItems.map(item => item.id === id ? { ...item, ...updates } : item);
    onUpdateProject({ vaultItems: updated });
  };

  const deleteVaultItem = (id: string) => {
    if (!onUpdateProject || !project.vaultItems) return;
    const updated = project.vaultItems.filter(item => item.id !== id);
    onUpdateProject({ vaultItems: updated });
  };

  const getFilteredVaultItems = () => {
    const items = project.vaultItems || [];
    if (vaultFilter === 'ALL') return items;
    if (vaultFilter === 'IMAGE') return items.filter(i => i.type === 'IMAGE');
    if (vaultFilter === 'VIDEO') return items.filter(i => i.type === 'VIDEO');
    if (vaultFilter === 'DOCS') return items.filter(i => ['PDF', 'TEXT', 'ARCHIVE'].includes(i.type));
    return items;
  };

  const activeCharacter = project.characters?.find(c => c.id === activeAssetId);
  const activePoster = project.posters?.find(p => p.id === activeAssetId);
  const activeScene = showcaseScenes.find(s => s.id === activeSceneId);

  const buildCharacterPrompt = () => {
    if (!activeCharacter) return "";
    const details = [
      activeCharacter.gender,
      activeCharacter.age ? `${activeCharacter.age} years old` : '',
      activeCharacter.nationality,
      activeCharacter.roleType,
      activeCharacter.bodyType ? `Body: ${activeCharacter.bodyType}` : '',
      activeCharacter.faceShape ? `Face: ${activeCharacter.faceShape} shape` : '',
      activeCharacter.skinTone ? `${activeCharacter.skinTone} skin` : '',
      activeCharacter.skinTexture ? `Texture: ${activeCharacter.skinTexture}` : '',
      activeCharacter.hairStyle ? `Hair: ${activeCharacter.hairStyle}` : '',
      activeCharacter.expression ? `Expression: ${activeCharacter.expression}` : '',
      activeCharacter.eyeGaze ? `Eyes: ${activeCharacter.eyeGaze}` : '',
      activeCharacter.clothing ? `wearing ${activeCharacter.clothing}` : '',
      activeCharacter.era ? `set in ${activeCharacter.era}` : '',
      activeCharacter.description
    ].filter(Boolean).join(", ");

    return `Cinematic portrait of ${activeCharacter.name}, ${details}, highly detailed, photorealistic, cinematic lighting, 8k resolution, ${project.genre} style`;
  };

  const handleApplyCharacterPrompt = () => {
    if (!activeCharacter) return;
    const constructed = buildCharacterPrompt();
    onUpdateCharacter(activeCharacter.id, { visualPrompt: constructed });
  };

  const handleGenerateCharacter = () => {
    if (!activeCharacter) return;
    const promptToUse = activeCharacter.visualPrompt || buildCharacterPrompt();
    handleGenerateAssetImage(promptToUse, 'CHARACTER', activeCharacter.id);
  };

  const handleDownloadImage = (url: string | null, filename: string) => {
     if (url && window.saveAs) {
        window.saveAs(url, filename);
     } else if (url) {
        // Fallback
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
     }
  };

  const renderEmptyState = (icon: React.ElementType, title: string, subtitle: string, action: () => void, actionText: string) => (
    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
      <div className="bg-zinc-900 p-6 rounded-full mb-4 border border-zinc-800">
         {React.createElement(icon, { size: 48, className: "opacity-50" })}
      </div>
      <h3 className="text-xl font-bold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs text-center">{subtitle}</p>
      <Button variant="accent" onClick={action} icon={<ICONS.Plus size={16}/>}>
        {actionText}
      </Button>
    </div>
  );

  // TABS CONFIG - Added Budget
  const TABS = [
    { id: 'DECK', icon: ICONS.Layout, label: t.slideDeck },
    { id: 'SCRIPT', icon: ICONS.ScrollText, label: t.scriptMagic },
    { id: 'CAST_CREW', icon: ICONS.UserPlus, label: t.castCrew },
    { id: 'STORYBOARD', icon: ICONS.Clapperboard, label: t.storyBoard },
    { id: 'BUDGET', icon: ICONS.Calculator, label: t.budgetForge }, // NEW TAB
    { id: 'VAULT', icon: ICONS.Box, label: t.cinemaVault },
    { id: 'CHARACTERS', icon: ICONS.Users, label: t.characters },
    { id: 'LOCATION', icon: ICONS.MapPin, label: t.locationScout },
    { id: 'POSTERS', icon: ICONS.Image, label: t.posters },
    { id: 'AUDIO', icon: ICONS.Mic, label: t.soundStage },
    { id: 'TRAILER', icon: ICONS.Video, label: t.mediaLibrary }
  ];

  const showSidebar = ['DECK', 'CHARACTERS', 'STORYBOARD', 'POSTERS', 'AUDIO'].includes(activeTab);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      
      {/* VIDEO PLAYBACK MODAL */}
      {playingVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200">
           <button 
             onClick={() => setPlayingVideo(null)}
             className="absolute top-6 right-8 p-3 bg-zinc-800/80 hover:bg-red-600/80 text-white rounded-full transition-colors z-[110]"
           >
              <ICONS.X size={24} />
           </button>
           
           <div className="w-full max-w-6xl p-4 flex flex-col items-center">
              <div className="w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden border border-zinc-800">
                 <video 
                   src={playingVideo.url} 
                   controls 
                   autoPlay 
                   className="w-full h-full object-contain"
                 />
              </div>
              <h2 className="text-2xl font-bold text-white mt-6">{playingVideo.title}</h2>
              <div className="flex gap-4 mt-2 text-zinc-500 text-sm">
                 <span className="uppercase tracking-wider">{playingVideo.source === 'AI' ? 'Generated with Veo' : 'Uploaded File'}</span>
                 <span>•</span>
                 <span>{new Date(playingVideo.createdAt).toLocaleDateString()}</span>
              </div>
           </div>
        </div>
      )}

      <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
           <button 
             onClick={onGoHome}
             className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors group mr-2"
             title="Back to Home / Categories"
           >
              <ICONS.Clapperboard size={20} className="text-amber-500 group-hover:rotate-12 transition-transform" />
           </button>

           <div className="h-6 w-px bg-zinc-800" />
           
           <button onClick={onStructureMode} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400" title="Back to Structure">
              <ICONS.ChevronLeft size={20} />
           </button>
           <h1 className="font-bold text-lg text-zinc-200 truncate max-w-xs">{project.title} <span className="text-zinc-600 text-xs ml-2 uppercase border border-zinc-700 rounded px-1">{project.serviceType.replace('_', ' ')}</span></h1>
        </div>
        <div className="flex items-center gap-2">
          {/* LANGUAGE TOGGLE FOR STUDIO VIEW - FIXED */}
          <div className="flex bg-zinc-800 border border-zinc-700 rounded-full p-0.5 mr-2">
             <button 
               onClick={() => onUpdateProject && onUpdateProject({ language: 'en' })} 
               className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${project.language === 'en' ? 'bg-amber-600 text-white' : 'text-zinc-500 hover:text-white'}`}
             >
                EN
             </button>
             <button 
               onClick={() => onUpdateProject && onUpdateProject({ language: 'ml' })} 
               className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${project.language === 'ml' ? 'bg-amber-600 text-white' : 'text-zinc-500 hover:text-white'}`}
             >
                ML
             </button>
          </div>

          {activeTab === 'STORYBOARD' && (
             <>
               <Button variant="secondary" icon={<ICONS.Play size={16} />} onClick={() => onPresentationMode('STORYBOARD')}>Present Storyboard</Button>
               {/* RENAMED EXPORT BUTTON */}
               <Button variant="accent" className="bg-amber-600 hover:bg-amber-500 text-white border-none" onClick={onExport} icon={<ICONS.Upload size={16} />}>EXPORT</Button>
             </>
          )}
          {activeTab === 'DECK' && (
             <Button variant="secondary" icon={<ICONS.Play size={16} />} onClick={() => onPresentationMode('DECK')}>{t.presentDeck}</Button>
          )}
          <Button variant="ghost" icon={<ICONS.Save size={16} />} onClick={onSave}>{t.save}</Button>

          {/* Divider */}
          <div className="h-6 w-px bg-zinc-800 mx-2"></div>

          {/* FAQ */}
          <button onClick={onOpenFAQ} className="text-zinc-500 hover:text-white transition-colors" title="Help & FAQ">
            <ICONS.HelpCircle size={20} />
          </button>
          
          {/* User Profile */}
          <div className="relative">
             <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold text-xs shadow-lg hover:ring-2 hover:ring-amber-500 transition-all">
               {currentUser?.name?.charAt(0) || "U"}
             </button>
             {showUserMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-4 py-2 border-b border-zinc-800 mb-1">
                   <p className="text-white font-bold text-sm truncate">{currentUser?.name || "Guest"}</p>
                   <p className="text-zinc-500 text-[10px] truncate">{currentUser?.email || ""}</p>
                   {currentUser?.role === 'ADMIN' && (
                      <span className="inline-block mt-1 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">SYSTEM ADMIN</span>
                   )}
                 </div>
                 <button onClick={() => { onOpenProfile?.(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm flex items-center gap-2"><ICONS.User size={14}/> {t.myProfile}</button>
                 <button onClick={() => { onOpenAdmin?.(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm flex items-center gap-2">
                    <ICONS.Settings size={14}/> 
                    {currentUser?.role === 'ADMIN' ? "System Admin" : "Project Settings"}
                 </button>
                 <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-800 text-sm flex items-center gap-2"><ICONS.LogOut size={14}/> {t.logout}</button>
               </div>
             )}
          </div>

        </div>
      </header>

      {/* NEW LANDSCAPE MENU BAR */}
      <div className="h-14 border-b border-zinc-800 bg-black flex items-center px-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
         {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as StudioTab)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all
                ${activeTab === tab.id 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }
              `}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
         ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <aside className="w-80 border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto p-2 bg-zinc-900/30 relative">
              {activeTab === 'DECK' && (
                <div className="space-y-2 pb-16">
                  {slides.map((s, idx) => (
                    <SlideThumbnail 
                      key={s.id}
                      slide={s}
                      index={idx}
                      isActive={activeSlideId === s.id}
                      onClick={() => setActiveSlideId(s.id)}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                    />
                  ))}
                  <div className="pt-2">
                     <Button variant="secondary" onClick={onAddSlide} className="w-full text-sm py-2 border-dashed border-2">
                       <ICONS.Plus size={14} className="mr-2"/> {t.addSlide}
                     </Button>
                  </div>
                </div>
              )}

              {/* SCRIPT LEFT PANE IS HANDLED INSIDE THE MAIN SCRIPT VIEW */}

              {activeTab === 'CHARACTERS' && (
                <div className="space-y-2 p-2">
                  {project.characters?.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => setActiveAssetId(c.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${activeAssetId === c.id ? 'bg-zinc-800 border-amber-600' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                        {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover"/> : <ICONS.User className="m-2 text-zinc-600"/>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-zinc-200 truncate">{c.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{c.roleType}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={createNewCharacter} className="w-full mt-4">
                    <ICONS.Plus size={14} className="mr-2"/> Add Character
                  </Button>
                </div>
              )}

              {activeTab === 'STORYBOARD' && (
                <div className="space-y-2 pb-16">
                  {showcaseScenes.map((scene, idx) => (
                     <div 
                       key={scene.id}
                       onClick={() => setActiveSceneId(scene.id)}
                       className={`p-2 rounded border cursor-pointer flex gap-2 ${activeSceneId === scene.id ? 'bg-amber-900/20 border-amber-600' : 'bg-zinc-900 border-zinc-800'}`}
                     >
                        <div className="w-16 h-10 bg-black rounded overflow-hidden shrink-0">
                           {scene.imageUrl && <img src={scene.imageUrl} className="w-full h-full object-cover"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-xs font-bold text-white truncate">SCENE {idx+1}</h4>
                           <p className="text--[10px] text-zinc-500 truncate">{scene.heading}</p>
                           <div className="flex gap-1 mt-1">
                              <span className="text-[8px] bg-zinc-800 px-1 rounded text-zinc-400">{scene.shotSize?.split(' ')[0]}</span>
                              <span className="text-[8px] bg-zinc-800 px-1 rounded text-zinc-400">{scene.lensType}</span>
                           </div>
                        </div>
                     </div>
                  ))}
                  <div className="pt-2">
                     <Button variant="secondary" onClick={onGenerateNextScene} className="w-full text-xs py-2 border-dashed border-2">
                       <ICONS.Plus size={12} className="mr-2"/> Add Next Scene
                     </Button>
                  </div>
                </div>
              )}

              {activeTab === 'POSTERS' && (
                <div className="space-y-2 p-2">
                  {project.posters?.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => setActiveAssetId(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${activeAssetId === p.id ? 'bg-zinc-800 border-green-600' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className="w-8 h-12 bg-zinc-800 overflow-hidden flex-shrink-0 rounded-sm">
                        {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <ICONS.Image className="m-2 text-zinc-600"/>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-zinc-200 truncate">{p.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{p.aspectRatio}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={createNewPoster} className="w-full mt-4">
                    <ICONS.Plus size={14} className="mr-2"/> New Poster
                  </Button>
                </div>
              )}

              {activeTab === 'AUDIO' && (
                <div className="p-6 space-y-4">
                   <h3 className="text-xs font-bold text-pink-500 uppercase mb-4 flex items-center gap-2"><ICONS.Mic size={14}/> Voice Generator</h3>
                   <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Voice Actor</label>
                      <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
                         {VOICE_OPTIONS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Dialogue Text</label>
                      <textarea 
                        className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm resize-none"
                        placeholder="Type what you want the character to say..."
                        value={audioText}
                        onChange={(e) => setAudioText(e.target.value)}
                      />
                   </div>
                   <Button className="w-full" variant="accent" onClick={handleGenerateAudio} isLoading={isGeneratingAudio}>
                      Generate Voice
                   </Button>
                </div>
              )}

              {/* Default Sidebar Content for other tabs */}
              {!['DECK', 'CHARACTERS', 'STORYBOARD', 'POSTERS', 'AUDIO', 'SCRIPT', 'CAST_CREW'].includes(activeTab) && (
                 <div className="p-6 text-center text-zinc-600 text-xs">
                    <ICONS.Settings size={24} className="mx-auto mb-2 opacity-50"/>
                    <p>Configure settings in the main view.</p>
                 </div>
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 flex overflow-hidden bg-zinc-950 relative">
           
           {/* --- BUDGET FORGE TAB --- */}
           {activeTab === 'BUDGET' && (
             <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto">
                <div className="max-w-6xl mx-auto w-full p-8 space-y-8">
                   
                   {/* Header */}
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 gap-4">
                      <div>
                         <h2 className="text-2xl font-bold text-white cinematic-font flex items-center gap-3">
                            <ICONS.Calculator size={24} className="text-green-500"/>
                            BUDGET<span className="text-green-500">FORGE</span>
                         </h2>
                         <p className="text-zinc-500 text-sm mt-1">AI Line Producer & Cost Estimation</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex gap-2">
                            <select 
                               className="bg-zinc-950 text-white text-xs p-2 rounded border border-zinc-700"
                               value={budgetScale}
                               onChange={(e) => setBudgetScale(e.target.value as any)}
                            >
                               <option value="Micro/Indie">Micro/Indie</option>
                               <option value="Mid-Range">Mid-Range</option>
                               <option value="Blockbuster">Blockbuster</option>
                            </select>
                            <select 
                               className="bg-zinc-950 text-white text-xs p-2 rounded border border-zinc-700"
                               value={budgetCurrency}
                               onChange={(e) => setBudgetCurrency(e.target.value as any)}
                            >
                               <option value="INR">INR (₹)</option>
                               <option value="USD">USD ($)</option>
                            </select>
                         </div>
                         <Button variant="accent" onClick={handleGenerateBudget} isLoading={isGeneratingBudget} className="bg-green-600 hover:bg-green-500">
                            <ICONS.Wand2 size={16} className="mr-2"/> Generate Estimate
                         </Button>
                      </div>
                   </div>

                   {/* Dashboard Stats */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10"><ICONS.Coins size={64}/></div>
                         <h3 className="text-zinc-500 text-xs uppercase font-bold mb-2">{t.totalBudgetTitle}</h3>
                         <p className="text-4xl font-bold text-white tracking-tight">{formatMoney(getTotalBudget())}</p>
                         <p className="text-zinc-500 text-xs mt-2">Estimated {budgetScale} Production</p>
                      </div>
                      
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                         <h3 className="text-zinc-500 text-xs uppercase font-bold mb-4">{t.aboveLineTitle}</h3>
                         <div className="space-y-2">
                            {project.budgetItems?.filter(i => i.category === 'Above The Line').slice(0, 3).map((item, idx) => (
                               <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-zinc-300 truncate pr-4">{item.item}</span>
                                  <span className="font-mono text-zinc-400">{formatMoney(item.cost)}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                         <h3 className="text-zinc-500 text-xs uppercase font-bold mb-4">{t.belowLineTitle}</h3>
                         <div className="space-y-2">
                            {project.budgetItems?.filter(i => i.category === 'Below The Line').slice(0, 3).map((item, idx) => (
                               <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-zinc-300 truncate pr-4">{item.item}</span>
                                  <span className="font-mono text-zinc-400">{formatMoney(item.cost)}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Full Budget Table */}
                   <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
                         <h3 className="font-bold text-white">Detailed Breakdown</h3>
                         <div className="flex gap-2">
                            <button className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 border border-zinc-800 rounded px-2 py-1 transition-colors" onClick={handleDownloadBudgetCSV}>
                               <ICONS.FileText size={12}/> Export CSV
                            </button>
                            <button className="text-xs text-green-500 hover:text-white flex items-center gap-1 border border-zinc-800 rounded px-2 py-1 transition-colors" onClick={() => window.print()}>
                               <ICONS.Download size={12}/> Print View
                            </button>
                         </div>
                      </div>
                      <table className="w-full text-left text-sm">
                         <thead className="bg-zinc-950/50 text-zinc-500 text-xs uppercase font-bold">
                            <tr>
                               <th className="p-4 w-1/4">Category</th>
                               <th className="p-4 w-1/3">Line Item</th>
                               <th className="p-4">Notes</th>
                               <th className="p-4 text-right">Cost</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {project.budgetItems?.map((item) => (
                               <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                                  <td className="p-4 text-zinc-500 font-bold text-xs uppercase">{item.category}</td>
                                  <td className="p-4 font-medium">{item.item}</td>
                                  <td className="p-4 text-zinc-500 text-xs">{item.notes}</td>
                                  <td className="p-4 text-right font-mono text-white">{formatMoney(item.cost)}</td>
                               </tr>
                            ))}
                            {(!project.budgetItems || project.budgetItems.length === 0) && (
                               <tr>
                                  <td colSpan={4} className="p-12 text-center text-zinc-600">
                                     <ICONS.Calculator size={48} className="mx-auto mb-4 opacity-50"/>
                                     <p>No budget generated yet.</p>
                                     <p className="text-xs mt-2">Select your scale and currency, then click "Generate Estimate".</p>
                                  </td>
                               </tr>
                            )}
                         </tbody>
                         {project.budgetItems && project.budgetItems.length > 0 && (
                            <tfoot className="bg-zinc-950 font-bold border-t-2 border-zinc-800 text-white">
                               <tr>
                                  <td colSpan={3} className="p-4 text-right uppercase tracking-wider text-xs">Total Estimated Budget</td>
                                  <td className="p-4 text-right font-mono text-lg text-green-400">{formatMoney(getTotalBudget())}</td>
                               </tr>
                            </tfoot>
                         )}
                      </table>
                   </div>

                </div>
             </div>
           )}

           {/* ... [Cast & Crew View code - Unchanged] ... */}
           {activeTab === 'CAST_CREW' && (
             <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto">
               <div className="max-w-6xl mx-auto w-full p-8 space-y-12">
                  {/* ... Existing Cast & Crew content ... */}
                  <section>
                     <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-4">
                        <div>
                           <h2 className="text-2xl font-bold text-white cinematic-font tracking-wide flex items-center gap-3">
                              <ICONS.Users size={24} className="text-emerald-500"/>
                              THE CAST
                           </h2>
                           <p className="text-zinc-500 text-sm mt-1">Character visualizations and proposed talent.</p>
                        </div>
                        <Button variant="accent" onClick={handleAddCastMember} icon={<ICONS.Plus size={16}/>}>
                           Add Casting Row
                        </Button>
                     </div>

                     <div className="space-y-6">
                        {project.castList?.map((cast, index) => (
                           <div key={cast.id} className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center group hover:border-emerald-600/50 transition-colors">
                              {/* Remove Button */}
                              <button 
                                 onClick={() => handleDeleteCastMember(cast.id)}
                                 className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <ICONS.Trash2 size={16}/>
                              </button>

                              {/* Index */}
                              <div className="text-zinc-600 font-mono font-bold text-xl opacity-30 md:block hidden">
                                 {String(index + 1).padStart(2, '0')}
                              </div>

                              {/* LEFT: CHARACTER */}
                              <div className="flex-1 w-full">
                                 <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-wider">Role / Character</label>
                                 <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 group/img">
                                       {cast.characterImage ? (
                                          <img src={cast.characterImage} className="w-full h-full object-cover"/>
                                       ) : (
                                          <ICONS.User size={24} className="text-zinc-700"/>
                                       )}
                                       <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity">
                                          <ICONS.Upload size={16} className="text-white"/>
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCastImageUpload(e, cast.id, 'characterImage')}/>
                                       </label>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                       <input 
                                          className="w-full bg-transparent text-lg font-bold text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
                                          placeholder="Character Name"
                                          value={cast.characterName}
                                          onChange={(e) => handleUpdateCastMember(cast.id, { characterName: e.target.value })}
                                       />
                                       <p className="text-xs text-zinc-500 mt-1">Concept Visual</p>
                                    </div>
                                 </div>
                              </div>

                              {/* ARROW */}
                              <div className="text-zinc-700">
                                 <ICONS.ArrowRight size={24} />
                              </div>

                              {/* RIGHT: ACTOR */}
                              <div className="flex-1 w-full text-right md:text-left md:flex-row-reverse flex gap-4">
                                 <div className="w-24 h-24 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 group/img">
                                       {cast.actorImage ? (
                                          <img src={cast.actorImage} className="w-full h-full object-cover"/>
                                       ) : (
                                          <ICONS.User size={24} className="text-zinc-700"/>
                                       )}
                                       <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity">
                                          <ICONS.Upload size={16} className="text-white"/>
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCastImageUpload(e, cast.id, 'actorImage')}/>
                                       </label>
                                 </div>
                                 <div className="flex-1 flex flex-col justify-center items-end md:items-start">
                                       <input 
                                          className="w-full bg-transparent text-lg font-bold text-white placeholder-zinc-700 outline-none border-b border-transparent focus:border-emerald-500 transition-colors text-right md:text-left"
                                          placeholder="Proposed Actor"
                                          value={cast.actorName}
                                          onChange={(e) => handleUpdateCastMember(cast.id, { actorName: e.target.value })}
                                       />
                                       <p className="text-xs text-zinc-500 mt-1">Talent Headshot</p>
                                 </div>
                              </div>

                           </div>
                        ))}
                        {(!project.castList || project.castList.length === 0) && (
                           <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                              <ICONS.Users className="mx-auto text-zinc-700 mb-4" size={48}/>
                              <p className="text-zinc-500">No cast members added yet.</p>
                              <Button variant="secondary" onClick={handleAddCastMember} className="mt-4">Start Casting</Button>
                           </div>
                        )}
                     </div>
                  </section>

                  {/* SECTION 2: CREW TABLE */}
                  <section>
                     <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-4">
                        <div>
                           <h2 className="text-2xl font-bold text-white cinematic-font tracking-wide flex items-center gap-3">
                              <ICONS.Briefcase size={24} className="text-blue-500"/>
                              THE CREW
                           </h2>
                           <p className="text-zinc-500 text-sm mt-1">Key production roles and heads of department.</p>
                        </div>
                        <Button variant="secondary" onClick={handleAddCrewMember} icon={<ICONS.Plus size={16}/>}>
                           Add Crew Member
                        </Button>
                     </div>

                     <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                           <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase font-bold tracking-wider">
                              <tr>
                                 <th className="p-4 w-1/3">Role / Department</th>
                                 <th className="p-4">Name</th>
                                 <th className="p-4 w-16"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-800">
                              {project.crewList?.map((crew) => (
                                 <tr key={crew.id} className="group hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4">
                                       <input 
                                          className="w-full bg-transparent text-sm font-bold text-zinc-300 placeholder-zinc-600 outline-none focus:text-blue-400 transition-colors"
                                          placeholder="e.g. Director"
                                          value={crew.role}
                                          onChange={(e) => handleUpdateCrewMember(crew.id, { role: e.target.value })}
                                       />
                                    </td>
                                    <td className="p-4">
                                       <input 
                                          className="w-full bg-transparent text-sm text-white placeholder-zinc-700 outline-none focus:text-white"
                                          placeholder="Enter Name"
                                          value={crew.name}
                                          onChange={(e) => handleUpdateCrewMember(crew.id, { name: e.target.value })}
                                       />
                                    </td>
                                    <td className="p-4 text-right">
                                       <button 
                                          onClick={() => handleDeleteCrewMember(crew.id)}
                                          className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                       >
                                          <ICONS.Trash2 size={14}/>
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                        {(!project.crewList || project.crewList.length === 0) && (
                           <div className="p-8 text-center text-zinc-500 text-sm italic">
                              No crew roles defined.
                           </div>
                        )}
                     </div>
                  </section>

               </div>
             </div>
           )}

           {/* ... [Vault View code - Unchanged] ... */}
           {activeTab === 'VAULT' && (
             <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto">
                <div className="max-w-6xl mx-auto w-full p-8">
                   
                   <div className="flex justify-between items-center mb-8">
                      <div>
                         <h2 className="text-2xl font-bold text-white cinematic-font flex items-center gap-3">
                            <ICONS.Box size={24} className="text-orange-500"/>
                            CINEMA VAULT
                         </h2>
                         <p className="text-zinc-500 text-sm mt-1">Research, legal, and creative asset storage.</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         {/* Filter Tabs */}
                         <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex">
                            {['ALL', 'IMAGE', 'VIDEO', 'DOCS'].map(filter => (
                               <button 
                                 key={filter}
                                 onClick={() => setVaultFilter(filter as any)}
                                 className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${vaultFilter === filter ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                               >
                                  {filter}
                               </button>
                            ))}
                         </div>
                         
                         {/* Upload Button */}
                         <label className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md cursor-pointer transition-colors font-bold text-sm shadow-lg shadow-orange-900/20">
                            <ICONS.Upload size={16}/>
                            Upload Assets
                            <input 
                               type="file" 
                               multiple 
                               className="hidden" 
                               onChange={handleVaultUpload}
                            />
                         </label>
                      </div>
                   </div>

                   {/* VAULT GRID */}
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {getFilteredVaultItems().map((item) => (
                         <div key={item.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col relative">
                            {/* ... Vault Item Card ... */}
                            <div className="aspect-square bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                               {item.type === 'IMAGE' && <img src={item.url} className="w-full h-full object-cover"/>}
                               {/* ... other types ... */}
                               {item.type === 'VIDEO' && (
                                  <div className="w-full h-full relative">
                                     <video src={item.url} className="w-full h-full object-cover"/>
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/20"><ICONS.Play size={32} className="text-white opacity-80"/></div>
                                  </div>
                               )}
                               {item.type === 'PDF' && <ICONS.FileText size={48} className="text-red-500"/>}
                               {item.type === 'TEXT' && <ICONS.FileText size={48} className="text-zinc-500"/>}
                               {item.type === 'ARCHIVE' && <ICONS.Archive size={48} className="text-yellow-500"/>}
                               {item.type === 'AUDIO' && <ICONS.Mic size={48} className="text-pink-500"/>}
                               {item.type === 'UNKNOWN' && <ICONS.File size={48} className="text-zinc-600"/>}

                               {/* Hover Actions */}
                               <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                                  <div className="flex gap-2">
                                     <button 
                                       onClick={() => setEditingVaultItem(item)} 
                                       className="p-2 bg-zinc-800 rounded-full hover:bg-white hover:text-black transition-colors"
                                       title="Edit Details"
                                     >
                                        <ICONS.Settings size={16}/>
                                     </button>
                                     <a 
                                       href={item.url} 
                                       download={item.fileName}
                                       className="p-2 bg-zinc-800 rounded-full hover:bg-white hover:text-black transition-colors"
                                       title="Download"
                                     >
                                        <ICONS.Download size={16}/>
                                     </a>
                                     <button 
                                       onClick={() => deleteVaultItem(item.id)}
                                       className="p-2 bg-zinc-800 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                                       title="Delete"
                                     >
                                        <ICONS.Trash2 size={16}/>
                                     </button>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 mt-2 line-clamp-3">
                                     {item.description || "No description provided."}
                                  </p>
                               </div>
                            </div>

                            {/* INFO AREA */}
                            <div className="p-3 bg-zinc-900 border-t border-zinc-800">
                               <div className="flex items-center gap-2 mb-1">
                                  {item.type === 'PDF' && <ICONS.FileText size={12} className="text-red-500"/>}
                                  {item.type === 'IMAGE' && <ICONS.Image size={12} className="text-blue-500"/>}
                                  {item.type === 'VIDEO' && <ICONS.Video size={12} className="text-purple-500"/>}
                                  <h4 className="text-xs font-bold text-zinc-200 truncate flex-1">{item.title}</h4>
                               </div>
                               <div className="flex justify-between text-[10px] text-zinc-600">
                                  <span>{item.fileSize}</span>
                                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                      ))}
                      
                      {/* Empty State */}
                      {getFilteredVaultItems().length === 0 && (
                         <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <ICONS.Box size={48} className="mx-auto text-zinc-700 mb-4"/>
                            <h3 className="text-zinc-400 font-bold">Vault Empty</h3>
                            <p className="text-zinc-600 text-sm mt-1">Upload research, documents, or media to secure them.</p>
                         </div>
                      )}
                   </div>

                   {/* EDIT MODAL */}
                   {editingVaultItem && (
                      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                         <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                            <h3 className="text-lg font-bold text-white mb-4">Edit Asset Details</h3>
                            <div className="space-y-4">
                               <div>
                                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Title</label>
                                  <input 
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm"
                                    value={editingVaultItem.title}
                                    onChange={(e) => setEditingVaultItem({...editingVaultItem, title: e.target.value})}
                                  />
                               </div>
                               <div>
                                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Context Note</label>
                                  <textarea 
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm h-24 resize-none"
                                    placeholder="Add context about this file..."
                                    value={editingVaultItem.description}
                                    onChange={(e) => setEditingVaultItem({...editingVaultItem, description: e.target.value})}
                                  />
                               </div>
                               <div className="flex justify-end gap-2 pt-2">
                                  <Button variant="ghost" onClick={() => setEditingVaultItem(null)}>Cancel</Button>
                                  <Button variant="accent" onClick={() => {
                                     updateVaultItem(editingVaultItem.id, { 
                                        title: editingVaultItem.title, 
                                        description: editingVaultItem.description 
                                     });
                                     setEditingVaultItem(null);
                                  }}>Save Changes</Button>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                </div>
             </div>
           )}

           {/* ... [Main Content Rendering for Deck, Poster, etc. - Unchanged] ... */}
           {activeTab === 'DECK' && slide && (
             <>
              <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-zinc-900/30">
                 <div className="w-full aspect-video bg-black shadow-2xl relative group rounded-md overflow-hidden ring-1 ring-zinc-800">
                    {/* NO GRADIENT OR TEXT OVERLAY IN PREVIEW - CLEAN IMAGE */}
                    <img src={slide.imageUrl || PLACEHOLDER_IMAGE} className={`absolute inset-0 w-full h-full object-cover ${slide.imageUrl ? 'opacity-100' : 'opacity-30 grayscale'}`}/>
                 </div>
              </div>
              <div className="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col overflow-y-auto p-6 space-y-6">
                 <section>
                   {/* INFO BOX HERE */}
                   {slide.description && (
                     <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 mb-6 shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                         <ICONS.Info size={14} className="text-amber-500" />
                         <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Slide Objective</span>
                       </div>
                       <p className="text-sm text-zinc-200 leading-relaxed font-medium">{slide.description}</p>
                     </div>
                   )}

                   <div className="flex justify-between items-baseline mb-2">
                     <h3 className="text-xs font-bold text-amber-500">TEXT CONTENT</h3>
                     <Button variant="ghost" className="text-xs h-6 px-2 text-zinc-400" onClick={onGenerateContent} isLoading={isGeneratingContent}>AI Write</Button>
                   </div>
                   
                   <textarea 
                     className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-amber-900" 
                     value={slide.content} 
                     onChange={(e) => onUpdateSlide(slide.id, { content: e.target.value })} 
                     placeholder={slide.placeholder || t.textContent}
                   />
                 </section>
                 <section>
                    <div className="flex justify-between mb-2"><h3 className="text-xs font-bold text-amber-500">VISUALS</h3></div>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-300 mb-2" onChange={handleStyleChange} value={selectedStyle}><option value="">Director Style...</option>{DIRECTOR_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <div className="relative mb-2">
                       <textarea className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-amber-900" placeholder="Image Prompt..." value={slide.imagePrompt} onChange={(e) => onUpdateSlide(slide.id, { imagePrompt: e.target.value })} />
                       <button className="absolute bottom-2 right-2 text-amber-500 hover:text-amber-400" onClick={() => onAutoPrompt(selectedStyle)} disabled={isGeneratingPrompt}><ICONS.Wand2 size={14} /></button>
                    </div>
                    <Button className="w-full" variant="accent" onClick={onGenerateImage} disabled={!slide.imagePrompt} isLoading={isGeneratingImage}>Generate Image</Button>
                    <label className="flex items-center justify-center w-full mt-2 py-2 border border-zinc-800 rounded text-xs text-zinc-500 hover:bg-zinc-800 cursor-pointer transition-colors">
                      <ICONS.Upload size={12} className="mr-2"/> Upload Custom Image
                      <input type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
                    </label>
                 </section>
              </div>
             </>
           )}

           {/* --- NEW SCRIPT MAGIC SECTION --- */}
           {activeTab === 'SCRIPT' && (
             <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
               
               {/* SCRIPT TOOLBAR */}
               <div className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 shrink-0">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 cinematic-font tracking-wide">
                     <ICONS.ScrollText size={20} className="text-indigo-500"/>
                     SCRIPT <span className="text-indigo-500">MAGIC</span>
                  </h2>
                  <div className="flex gap-2">
                     <Button variant="secondary" className="text-xs" onClick={handleGenerateRoadmap} isLoading={isGeneratingRoadmap}>
                        <ICONS.Wand2 size={14} className="mr-2"/> Generate Roadmap
                     </Button>
                  </div>
               </div>

               <div className="flex-1 flex overflow-hidden">
                  
                  {/* LEFT PANE: CINEMATIC ROADMAP (12-POINT) */}
                  <div className="w-80 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
                     <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">The Seed Concept</h3>
                        <textarea 
                           className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white resize-none focus:border-indigo-500 outline-none"
                           placeholder="Enter your 20-line story idea here..."
                           value={scriptConcept}
                           onChange={(e) => setScriptConcept(e.target.value)}
                        />
                     </div>
                     <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {project.scriptRoadmap?.map((beat, idx) => (
                           <div 
                              key={beat.id}
                              onClick={() => handleBeatClick(beat)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${activeBeatId === beat.id ? 'bg-indigo-900/20 border-indigo-500 shadow-lg' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'}`}
                           >
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] font-mono text-zinc-500 font-bold">BEAT {idx + 1}</span>
                                 {activeBeatId === beat.id && isGeneratingTwist && <ICONS.Loader2 size={12} className="animate-spin text-indigo-500"/>}
                              </div>
                              <h4 className={`text-sm font-bold mb-1 ${activeBeatId === beat.id ? 'text-white' : 'text-zinc-300'}`}>{beat.title}</h4>
                              <p className="text-xs text-zinc-500 leading-snug">{beat.aiSuggestion || beat.description}</p>
                           </div>
                        ))}
                        {(!project.scriptRoadmap || project.scriptRoadmap.length === 0) && (
                           <div className="p-8 text-center text-zinc-600">
                              <ICONS.Layers size={32} className="mx-auto mb-2 opacity-50"/>
                              <p className="text-xs">Enter your concept above and click "Generate Roadmap" to create the 12-point structure.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* CENTER PANE: SCRIPT EDITOR */}
                  <div className="flex-1 flex flex-col bg-[#1a1a1a] relative">
                     <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                        <div className="w-full max-w-3xl h-full">
                           <textarea 
                              className="w-full h-full min-h-[800px] bg-transparent text-zinc-300 font-mono text-base leading-relaxed outline-none resize-none selection:bg-indigo-500/30 pb-32"
                              placeholder="INT. SCENE 1 - DAY..."
                              value={project.fullScript}
                              onChange={(e) => onUpdateProject && onUpdateProject({ fullScript: e.target.value })}
                              spellCheck={false}
                           />
                        </div>
                     </div>
                  </div>

                  {/* RIGHT PANE / OVERLAY: TWIST ENGINE */}
                  {activeBeatId && (
                     <div className="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl z-20">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/80 backdrop-blur">
                           <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <ICONS.Sparkles size={16} className="text-indigo-500"/> Twist Engine
                           </h3>
                           <button onClick={() => setActiveBeatId(null)} className="text-zinc-500 hover:text-white"><ICONS.X size={16}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                           {isGeneratingTwist ? (
                              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-4">
                                 <div className="relative">
                                    <div className="w-12 h-12 border-4 border-zinc-800 rounded-full"></div>
                                    <div className="w-12 h-12 border-4 border-t-indigo-500 rounded-full absolute top-0 left-0 animate-spin"></div>
                                 </div>
                                 <p className="text-xs animate-pulse">Consulting the Creative Director...</p>
                              </div>
                           ) : (
                              twistOptions.map((opt, idx) => (
                                 <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${
                                       opt.type === 'Classic' ? 'bg-blue-500' :
                                       opt.type === 'Emotional' ? 'bg-pink-500' : 'bg-amber-500'
                                    }`}></div>
                                    
                                    <div className="pl-3">
                                       <div className="flex justify-between items-start mb-2">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                             opt.type === 'Classic' ? 'bg-blue-900/30 text-blue-400' :
                                             opt.type === 'Emotional' ? 'bg-pink-900/30 text-pink-400' : 'bg-amber-900/30 text-amber-400'
                                          }`}>{opt.type} Path</span>
                                       </div>
                                       <h4 className="text-sm font-bold text-white mb-2">{opt.title}</h4>
                                       <p className="text-xs text-zinc-400 leading-relaxed mb-4">{opt.content}</p>
                                       <Button 
                                          variant="secondary" 
                                          className="w-full text-xs h-8 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-colors"
                                          onClick={() => handleApplyTwist(opt.content)}
                                       >
                                          <ICONS.Plus size={14} className="mr-2"/> Add to Script
                                       </Button>
                                    </div>
                                 </div>
                              ))
                           )}
                           
                           {!isGeneratingTwist && twistOptions.length > 0 && (
                              <Button 
                                 variant="ghost" 
                                 className="w-full text-xs text-zinc-500 hover:text-white"
                                 onClick={() => {
                                    const beat = project.scriptRoadmap?.find(b => b.id === activeBeatId);
                                    if (beat) handleBeatClick(beat);
                                 }}
                              >
                                 <ICONS.RotateCcw size={14} className="mr-2"/> Spin Again (Regenerate)
                              </Button>
                           )}
                        </div>
                     </div>
                  )}
               </div>
             </div>
           )}

           {activeTab === 'CHARACTERS' && (
             activeCharacter ? (
             <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
                {isFullscreenPreview && activeCharacter.imageUrl && (
                  <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-8 cursor-zoom-out" onClick={() => setIsFullscreenPreview(false)}>
                    <img src={activeCharacter.imageUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl border border-zinc-800"/>
                  </div>
                )}
                {/* Character Preview */}
                <div className="h-[50vh] min-h-[400px] border-b border-zinc-800 flex bg-zinc-900/20 shrink-0">
                    <div className="flex-1 p-4 flex items-center justify-center relative">
                      <div className="h-full relative group cursor-zoom-in flex items-center justify-center" onClick={() => setIsFullscreenPreview(true)}>
                         <img src={activeCharacter.imageUrl || PLACEHOLDER_IMAGE} className={`max-h-full max-w-full object-contain rounded border border-zinc-800 shadow-xl ${activeCharacter.imageUrl ? '' : 'opacity-10 grayscale'}`} />
                         {!activeCharacter.imageUrl && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-center"><ICONS.User size={48} className="text-zinc-700 mx-auto mb-2"/><p className="text-zinc-600 text-xs">Preview Area</p></div></div>}
                      </div>
                   </div>
                   <div className="w-64 border-l border-zinc-800 flex flex-col bg-zinc-900/50 divide-y divide-zinc-800 overflow-y-auto">
                        <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
                        <p className="text-[10px] text-amber-500 mb-2 uppercase tracking-widest font-bold flex items-center gap-1">
                           <ICONS.User size={12}/> Face Ref (Identity)
                        </p>
                        <div className="w-full aspect-square bg-zinc-900 border border-dashed border-zinc-700 rounded flex items-center justify-center relative group">
                           {activeCharacter.referenceImageUrl ? (
                              <img src={activeCharacter.referenceImageUrl} className="w-full h-full object-cover rounded opacity-80" />
                           ) : (
                              <ICONS.Plus className="text-zinc-600"/>
                           )}
                           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCharacterRefUpload(e, 'FACE')}/>
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white pointer-events-none transition-opacity">Change</div>
                        </div>
                      </div>

                      <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
                        <p className="text-[10px] text-blue-500 mb-2 uppercase tracking-widest font-bold flex items-center gap-1">
                           <ICONS.Activity size={12}/> Pose Ref (Body)
                        </p>
                        <div className="w-full aspect-square bg-zinc-900 border border-dashed border-zinc-700 rounded flex items-center justify-center relative group">
                           {activeCharacter.actionReferenceImageUrl ? (
                              <img src={activeCharacter.actionReferenceImageUrl} className="w-full h-full object-cover rounded opacity-80" />
                           ) : (
                              <ICONS.Plus className="text-zinc-600"/>
                           )}
                           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCharacterRefUpload(e, 'ACTION')}/>
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white pointer-events-none transition-opacity">Change</div>
                        </div>
                      </div>
                   </div>
                </div>
                {/* Character Form Inputs */}
                <div className="flex-1 bg-zinc-900 overflow-y-auto">
                   <div className="max-w-7xl mx-auto p-6">
                      <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-xs font-bold text-amber-500 uppercase tracking-wider">Visual Prompt Generator</label>
                          <button onClick={handleApplyCharacterPrompt} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"><ICONS.Wand2 size={12}/> Auto-fill from Options</button>
                        </div>
                        <div className="flex gap-4">
                           <textarea className="flex-1 h-24 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 outline-none focus:border-amber-600 resize-none font-mono" value={activeCharacter.visualPrompt} onChange={(e) => onUpdateCharacter(activeCharacter.id, { visualPrompt: e.target.value })}/>
                           <div className="flex flex-col gap-2 w-48 justify-end">
                              <Button variant="accent" className="h-full w-full flex flex-col items-center justify-center gap-2" onClick={handleGenerateCharacter} isLoading={isAssetGenerating}><ICONS.Wand2 size={24}/><span>Generate Image</span></Button>
                           </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                         <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase border-b border-zinc-800 pb-2">1. Identity</h3>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Full Name</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.name} onChange={(e) => onUpdateCharacter(activeCharacter.id, { name: e.target.value })} /></div>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Role Type</label><select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.roleType} onChange={(e) => onUpdateCharacter(activeCharacter.id, { roleType: e.target.value as any })}>{ROLE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase border-b border-zinc-800 pb-2">2. Anatomy</h3>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Gender</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.gender} onChange={(e) => onUpdateCharacter(activeCharacter.id, { gender: e.target.value })} /></div>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Body Type</label><select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.bodyType} onChange={(e) => onUpdateCharacter(activeCharacter.id, { bodyType: e.target.value })}>{BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase border-b border-zinc-800 pb-2">3. Style & Origin</h3>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Nationality</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.nationality} onChange={(e) => onUpdateCharacter(activeCharacter.id, { nationality: e.target.value })} /></div>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Era</label><input className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.era} onChange={(e) => onUpdateCharacter(activeCharacter.id, { era: e.target.value })} /></div>
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase border-b border-zinc-800 pb-2">4. Performance</h3>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Expression</label><select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" value={activeCharacter.expression} onChange={(e) => onUpdateCharacter(activeCharacter.id, { expression: e.target.value })}>{EXPRESSIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}</select></div>
                            <div><label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">Render Style</label><select className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm outline-none" onChange={(e) => onUpdateCharacter(activeCharacter.id, { visualPrompt: activeCharacter.visualPrompt + " " + e.target.value })}>{CHARACTER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             ) : (
                renderEmptyState(ICONS.Users, "No Character Selected", "Create a new character.", createNewCharacter, "Create Character")
             )
           )}

           {activeTab === 'POSTERS' && (
             activePoster ? (
             <>
               <div className="flex-1 p-8 flex flex-col items-center justify-center bg-zinc-950 relative">
                  <div className={`transition-all duration-300 bg-zinc-900 shadow-2xl border border-zinc-800 relative overflow-hidden group ${activePoster.aspectRatio === '2:3' ? 'h-[75vh] aspect-[2/3]' : activePoster.aspectRatio === '16:9' ? 'w-[80%] aspect-video' : 'h-[65vh] aspect-square'}`}>
                     {activePoster.imageUrl ? <img src={activePoster.imageUrl} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ICONS.Image size={64} className="opacity-20"/></div>}
                     <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 text-center bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <h1 className="text-4xl font-bold text-white uppercase tracking-widest drop-shadow-xl cinematic-font">{activePoster.title}</h1>
                        <p className="text-amber-500 tracking-widest text-sm mt-2 uppercase">{activePoster.tagline}</p>
                     </div>
                  </div>

                  {/* DOWNLOAD BUTTON */}
                  {activePoster.imageUrl && (
                    <div className="mt-4 flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Button variant="secondary" className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white" onClick={() => handleDownloadImage(activePoster.imageUrl, `${activePoster.title.replace(/\s+/g,'_')}_Poster.png`)}>
                        <ICONS.Download size={18} className="mr-2"/> Download Poster
                      </Button>
                    </div>
                  )}
               </div>

               <div className="w-80 border-l border-zinc-800 bg-zinc-900 p-6 space-y-6 overflow-y-auto">
                 {/* ... Poster Sidebar ... */}
                 <h2 className="text-lg font-bold text-white flex items-center gap-2"><ICONS.Image size={20} className="text-green-500"/> Poster Studio</h2>
                 <div className="space-y-4">
                   {/* ASPECT RATIO BUTTONS */}
                   <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => onUpdatePoster(activePoster.id, { aspectRatio: '2:3' })} className={`p-2 rounded border flex flex-col items-center gap-1 ${activePoster.aspectRatio === '2:3' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                           <ICONS.RectangleVertical size={16}/>
                           <span className="text-[10px]">9:16</span>
                       </button>
                       <button onClick={() => onUpdatePoster(activePoster.id, { aspectRatio: '1:1' })} className={`p-2 rounded border flex flex-col items-center gap-1 ${activePoster.aspectRatio === '1:1' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                           <ICONS.Square size={16}/>
                           <span className="text-[10px]">1:1</span>
                       </button>
                       <button onClick={() => onUpdatePoster(activePoster.id, { aspectRatio: '16:9' })} className={`p-2 rounded border flex flex-col items-center gap-1 ${activePoster.aspectRatio === '16:9' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                           <ICONS.RectangleHorizontal size={16}/>
                           <span className="text-[10px]">16:9</span>
                       </button>
                   </div>
                   
                   {/* CHARACTER REFERENCE FOR POSTER */}
                   <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                         <ICONS.User size={12}/> Starring / Reference
                      </h4>
                      <div>
                         <label className="text-[10px] text-zinc-400 block mb-1">Select Character</label>
                         <select 
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-xs mb-2"
                            value={activePoster.characterRefId || ""}
                            onChange={(e) => onUpdatePoster(activePoster.id, { characterRefId: e.target.value })}
                         >
                            <option value="">-- No Specific Character --</option>
                            {project.characters?.map(c => (
                               <option key={c.id} value={c.id}>{c.name} ({c.roleType})</option>
                            ))}
                         </select>
                      </div>
                      
                      <div className="relative border-t border-zinc-900 pt-2">
                         <label className="text-[10px] text-zinc-400 block mb-1">Or Upload Reference Image</label>
                         <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-zinc-900 rounded border border-dashed border-zinc-700 flex items-center justify-center relative overflow-hidden group">
                               {activePoster.referenceImageUrl ? (
                                  <img src={activePoster.referenceImageUrl} className="w-full h-full object-cover"/>
                               ) : (
                                  <ICONS.Upload size={14} className="text-zinc-600"/>
                               )}
                               <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePosterRefUpload} />
                            </div>
                            <span className="text-[10px] text-zinc-500 italic">
                               {activePoster.referenceImageUrl ? "Reference Loaded" : "Upload File"}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Content</h4>
                      <div><label className="text-[10px] text-zinc-400 block mb-1">Movie Title</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm" value={activePoster.title} onChange={(e) => onUpdatePoster(activePoster.id, { title: e.target.value })} /></div>
                      <div><label className="text-[10px] text-zinc-400 block mb-1">Tagline</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-sm" value={activePoster.tagline} onChange={(e) => onUpdatePoster(activePoster.id, { tagline: e.target.value })} /></div>
                   </div>
                   <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Art Direction</h4>
                      {/* Composition */}
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">{t.posterComposition}</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-xs" value={posterComposition} onChange={(e) => setPosterComposition(e.target.value)}>
                           <option value="">Auto / Standard</option>
                           {POSTER_COMPOSITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {/* Color Palette */}
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">{t.posterPalette}</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white text-xs" value={posterPalette} onChange={(e) => setPosterPalette(e.target.value)}>
                           <option value="">Auto / Standard</option>
                           {COLOR_PALETTES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                   </div>
                   <div>
                     <div className="flex justify-between items-end mb-1">
                        <label className="text-xs text-zinc-500 uppercase font-bold block">Visual Prompt</label>
                        {/* AUTO GENERATE BUTTON */}
                        <button 
                           onClick={handleAutoPosterPrompt} 
                           disabled={isAssetGenerating}
                           className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                           <ICONS.Wand2 size={12}/> Auto-Generate from Script
                        </button>
                     </div>
                     <textarea className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs resize-none" value={activePoster.prompt} onChange={(e) => onUpdatePoster(activePoster.id, { prompt: e.target.value })} placeholder="Describe the imagery..." />
                   </div>
                   <Button className="w-full py-4 text-sm font-bold" variant="accent" onClick={() => {
                      const finalPrompt = `Movie Poster Art. Title: "${activePoster.title}". ${activePoster.prompt}. Composition: ${posterComposition}. Colors: ${posterPalette}. High resolution, cinematic key art, textless --ar ${activePoster.aspectRatio.replace(':','-')}`;
                      handleGenerateAssetImage(finalPrompt, 'POSTER', activePoster.id, activePoster.aspectRatio);
                   }} isLoading={isAssetGenerating}>
                      <ICONS.Wand2 size={16} className="mr-2"/> Generate Poster
                   </Button>
                 </div>
               </div>
             </>
             ) : (
                renderEmptyState(ICONS.Image, "Poster Loft", "Create high-concept key art for your film.", createNewPoster, "New Poster Project")
             )
           )}

           {activeTab === 'STORYBOARD' && (
             activeScene ? (
               <div className="flex-1 flex h-full bg-zinc-950 overflow-hidden flex-row">
                  {/* ... [Storyboard content same as before] ... */}
                  <div className="flex-1 flex flex-col min-w-0 bg-black/20">
                     {/* ... (Keep Storyboard Content) ... */}
                     <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex gap-4 items-start shrink-0">
                        <div className="flex-1 relative">
                           <textarea 
                              className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 outline-none focus:border-amber-600 resize-none font-mono"
                              placeholder="Describe your scene or shot concept here..."
                              value={activeScene.visualPrompt || activeScene.action}
                              onChange={(e) => onUpdateScene(activeScene.id, { visualPrompt: e.target.value })}
                           />
                           <span className="absolute bottom-2 right-2 text-[10px] text-zinc-600 uppercase font-bold">AI Prompt Input</span>
                        </div>
                        <Button 
                          variant="accent" 
                          className="h-24 w-32 flex flex-col items-center justify-center gap-1"
                          onClick={handlePolishScenePrompt}
                          isLoading={isAssetGenerating}
                        >
                          <ICONS.Wand2 size={20} />
                          <span className="text-[10px] uppercase font-bold text-center">Generate<br/>Prompt</span>
                        </Button>
                     </div>

                     <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
                          <div className="flex-1 flex items-center justify-center p-8">
                           <div className="aspect-video w-full max-w-4xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                              {activeScene.imageUrl ? (
                                <img src={activeScene.imageUrl} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                  <ICONS.Clapperboard size={64} className="text-zinc-800 mb-4"/>
                                  <p className="text-zinc-600 text-sm font-mono">NO SIGNAL</p>
                                </div>
                              )}
                              
                              <div className="absolute inset-0 pointer-events-none opacity-30">
                                 <div className="w-full h-full border-[20px] border-transparent" style={{boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)"}}></div>
                                 <div className="absolute top-1/3 w-full h-px bg-white/10"></div>
                                 <div className="absolute top-2/3 w-full h-px bg-white/10"></div>
                                 <div className="absolute left-1/3 h-full w-px bg-white/10"></div>
                                 <div className="absolute left-2/3 h-full w-px bg-white/10"></div>
                              </div>
                              <div className="absolute bottom-4 left-4 text-[10px] font-mono text-amber-500 bg-black/80 px-2 py-1 rounded">
                                 {activeScene.lensType} | {activeScene.cameraAngle} | {activeScene.shotSize}
                              </div>
                           </div>
                          </div>
                          
                          <div className="h-16 flex items-center justify-between px-8 bg-gradient-to-t from-zinc-900 to-transparent absolute bottom-24 left-0 right-0 z-10">
                             <div className="flex gap-2">
                                <Button variant="accent" onClick={handleGenerateStoryboardShot} isLoading={isAssetGenerating}>Render Shot</Button>
                                <Button variant="secondary" onClick={handleGenerateStoryboardShot} isLoading={isAssetGenerating} disabled={!activeScene.imageUrl}>Render Again</Button>
                                <label className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:ring-zinc-600 border border-zinc-700 cursor-pointer">
                                  <ICONS.Upload size={16} className="mr-2"/> Upload Frame
                                  <input type="file" accept="image/*" className="hidden" onChange={handleStoryboardUpload}/>
                                </label>
                             </div>
                          </div>

                          <div className="h-24 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 gap-2 overflow-x-auto z-20 shrink-0">
                             {activeScene.generatedVariants?.map((variantUrl, idx) => (
                               <div 
                                 key={idx}
                                 onClick={() => onUpdateScene(activeScene.id, { imageUrl: variantUrl })}
                                 className={`h-16 aspect-video rounded cursor-pointer border-2 overflow-hidden transition-all ${activeScene.imageUrl === variantUrl ? 'border-amber-500 scale-105' : 'border-zinc-700 opacity-50 hover:opacity-100'}`}
                               >
                                  <img src={variantUrl} className="w-full h-full object-cover" />
                               </div>
                             ))}
                             {!activeScene.generatedVariants?.length && (
                                <div className="text-xs text-zinc-600 italic px-4">Generated versions will appear here...</div>
                             )}
                          </div>
                     </div>
                  </div>

                  <div className="w-80 border-l border-zinc-800 bg-zinc-900 p-6 overflow-y-auto shrink-0 z-30 shadow-xl">
                     <h3 className="text-xs font-bold text-white mb-4 uppercase flex items-center gap-2">
                        <ICONS.Activity size={14} className="text-amber-500"/> Action Logic
                     </h3>
                     
                     <div className="space-y-4">
                        <div>
                           <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Scene Heading</label>
                           <input 
                             className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs font-mono font-bold"
                             value={activeScene.heading}
                             onChange={(e) => onUpdateScene(activeScene.id, { heading: e.target.value })}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Action Description</label>
                           <textarea 
                             className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 text-sm resize-none"
                             value={activeScene.action}
                             onChange={(e) => onUpdateScene(activeScene.id, { action: e.target.value })}
                           />
                        </div>

                        {/* ... Casting ... */}
                        <div className="border-t border-zinc-800 pt-4">
                           <h4 className="text-[10px] text-zinc-500 uppercase font-bold mb-3 flex items-center gap-1"><ICONS.Users size={12}/> Casting / Actors</h4>
                           <div className="space-y-3">
                              <div>
                                 <label className="text-[10px] text-zinc-600 block mb-1">Character 1</label>
                                 <div className="flex gap-2">
                                   <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                                      {project.characters?.find(c => c.id === activeScene.characterRef1Id)?.imageUrl ? (
                                        <img src={project.characters.find(c => c.id === activeScene.characterRef1Id)!.imageUrl!} className="w-full h-full object-cover"/>
                                      ) : <ICONS.User size={16} className="m-2 text-zinc-600"/>}
                                   </div>
                                   <select 
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                                      value={activeScene.characterRef1Id || ''}
                                      onChange={(e) => onUpdateScene(activeScene.id, { characterRef1Id: e.target.value })}
                                   >
                                      <option value="">None</option>
                                      {project.characters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                   </select>
                                 </div>
                              </div>
                              <div>
                                 <label className="text-[10px] text-zinc-600 block mb-1">Character 2</label>
                                 <div className="flex gap-2">
                                   <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                                      {project.characters?.find(c => c.id === activeScene.characterRef2Id)?.imageUrl ? (
                                        <img src={project.characters.find(c => c.id === activeScene.characterRef2Id)!.imageUrl!} className="w-full h-full object-cover"/>
                                      ) : <ICONS.User size={16} className="m-2 text-zinc-600"/>}
                                   </div>
                                   <select 
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                                      value={activeScene.characterRef2Id || ''}
                                      onChange={(e) => onUpdateScene(activeScene.id, { characterRef2Id: e.target.value })}
                                   >
                                      <option value="">None</option>
                                      {project.characters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                   </select>
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        {/* ... Camera Logic ... */}
                        <div className="border-t border-zinc-800 pt-4">
                            <h4 className="text-[10px] text-zinc-500 uppercase font-bold mb-3 flex items-center gap-1"><ICONS.Camera size={12}/> Camera Logic</h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-zinc-600 block mb-1">Lens</label>
                                    <select 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                                        value={activeScene.lensType || '35mm'}
                                        onChange={(e) => onUpdateScene(activeScene.id, { lensType: e.target.value })}
                                    >
                                        {LENS_TYPES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-600 block mb-1">Angle</label>
                                    <select 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                                        value={activeScene.cameraAngle || 'Eye Level'}
                                        onChange={(e) => onUpdateScene(activeScene.id, { cameraAngle: e.target.value })}
                                    >
                                        {CAMERA_ANGLES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-600 block mb-1">Shot Size</label>
                                    <select 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                                        value={activeScene.shotSize || 'Wide'}
                                        onChange={(e) => onUpdateScene(activeScene.id, { shotSize: e.target.value })}
                                    >
                                        {SHOT_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ... Visual Style ... */}
                        <div className="border-t border-zinc-800 pt-4">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">Image Style</label>
                           <select 
                             className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs mb-2"
                             value={activeScene.imageStyle || ''}
                             onChange={(e) => onUpdateScene(activeScene.id, { imageStyle: e.target.value })}
                           >
                              <option value="">Select Style...</option>
                              {STORYBOARD_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                              <option value="Custom">Custom / Other</option>
                           </select>
                           {activeScene.imageStyle === 'Custom' && (
                             <input 
                               className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                               placeholder="Type custom style..."
                               onChange={(e) => onUpdateScene(activeScene.id, { imageStyle: e.target.value })}
                             />
                           )}
                        </div>
                        
                        <div className="border-t border-zinc-800 pt-4">
                           <label className="text-[10px] text-zinc-500 uppercase font-bold mb-2 block">Color Grading / Mood</label>
                           <select 
                             className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs mb-2"
                             value={activeScene.colorGrade || ''}
                             onChange={(e) => onUpdateScene(activeScene.id, { colorGrade: e.target.value })}
                           >
                              <option value="">Select Look...</option>
                              {VISUAL_STYLES.map(v => <option key={v} value={v}>{v}</option>)}
                              <option value="Custom">Custom / Other</option>
                           </select>
                           {activeScene.colorGrade === 'Custom' && (
                             <input 
                               className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                               placeholder="Type custom grading..."
                               onChange={(e) => onUpdateScene(activeScene.id, { colorGrade: e.target.value })}
                             />
                           )}
                        </div>
                        
                        {/* Camera Guides Grid (Already implemented) */}
                        <div className="mt-6 border-t border-zinc-800 pt-6">
                         <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                           <ICONS.Camera size={14} className="text-blue-500"/> Visual Shot Guide
                         </h3>
                         <div className="grid grid-cols-3 gap-2">
                            {[
                               { label: 'XCU', id: 'XCU', type: 'shotSize', icon: ICONS.Eye },
                               { label: 'CU', id: 'CU', type: 'shotSize', icon: ICONS.User },
                               { label: 'MCU', id: 'MCU', type: 'shotSize', icon: ICONS.User, iconScale: 0.8 },
                               { label: 'LOW', id: 'LOW', type: 'cameraAngle', icon: ICONS.ArrowUp },
                               { label: 'EYE', id: 'EYE', type: 'cameraAngle', icon: ICONS.Eye },
                               { label: 'HIGH', id: 'HIGH', type: 'cameraAngle', icon: ICONS.ArrowUp, rotate: 180 },
                               { label: 'WIDE', id: 'WIDE', type: 'shotSize', icon: ICONS.Grid },
                               { label: '2-SHOT', id: '2-SHOT', type: 'shotSize', icon: ICONS.Users },
                               { label: 'OTS', id: 'OTS', type: 'shotSize', icon: ICONS.User, special: 'ots' },
                               { label: 'DUTCH', id: 'DUTCH', type: 'cameraAngle', icon: ICONS.Video, rotate: 12 },
                               { label: 'BIRD', id: 'OVERHEAD', type: 'cameraAngle', icon: ICONS.Aperture },
                               { label: 'POV', id: 'POV', type: 'cameraAngle', icon: ICONS.Maximize2 }
                            ].map((btn) => (
                               <button
                                 key={btn.label}
                                 onClick={() => onUpdateScene(activeScene.id, { [btn.type]: btn.id })}
                                 className={`
                                   p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all group
                                   ${(activeScene as any)[btn.type] === btn.id 
                                      ? 'bg-amber-900/40 border-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                                   }
                                 `}
                               >
                                  <div className={`transition-transform ${btn.rotate ? `rotate-${btn.rotate}` : ''}`}>
                                     {btn.special === 'ots' ? (
                                        <div className="relative">
                                           <ICONS.User size={20} className="opacity-40"/>
                                           <ICONS.User size={14} className="absolute -bottom-1 -right-1"/>
                                        </div>
                                     ) : (
                                        <btn.icon size={20} className={btn.iconScale ? 'scale-75' : ''}/>
                                     )}
                                  </div>
                                  <span className="text-[10px] font-bold tracking-wider">{btn.label}</span>
                               </button>
                            ))}
                         </div>
                        </div>
                     </div>
                  </div>
               </div>
             ) : (
                renderEmptyState(ICONS.Clapperboard, "Storyboard Studio", "Select a shot from the timeline sidebar to edit technical details.", onGenerateNextScene, "Create First Shot")
             )
           )}

           {/* --- RESTORED LOCATION SCOUT SECTION --- */}
           {activeTab === 'LOCATION' && (
              <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
                 <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="max-w-4xl mx-auto flex gap-4 items-end">
                       <div className="flex-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Scene Requirement</label>
                          <input 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm"
                            placeholder="e.g. A misty, abandoned railway bridge surrounded by dense jungle."
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                          />
                       </div>
                       <div className="w-64">
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Target Region</label>
                          <input 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm"
                            placeholder="e.g. Kerala, India"
                            value={locationRegion}
                            onChange={(e) => setLocationRegion(e.target.value)}
                          />
                       </div>
                       <Button variant="accent" className="h-[46px] px-6 bg-teal-600 hover:bg-teal-500" onClick={handleFindLocations} isLoading={isScouting}>
                          <ICONS.MapPin size={18} className="mr-2"/> Scout Locations
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {scoutedLocations.map((loc) => (
                          <div key={loc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-teal-500/50 transition-all">
                             <div className="aspect-video bg-black relative">
                                {loc.imageUrl ? (
                                   <img src={loc.imageUrl} className="w-full h-full object-cover"/>
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center flex-col text-zinc-700">
                                      <ICONS.Image size={32} className="mb-2 opacity-50"/>
                                      <span className="text-xs uppercase font-bold tracking-widest">No Visual Yet</span>
                                   </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <Button variant="secondary" className="text-xs" onClick={() => handleVisualizeLocation(loc)} isLoading={isScouting}>
                                      <ICONS.Wand2 size={14} className="mr-2"/> Visualize Scene Here
                                   </Button>
                                </div>
                             </div>
                             <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                   <h3 className="font-bold text-white text-lg leading-tight">{loc.name}</h3>
                                   <a 
                                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + " " + (loc.coordinates || ""))}`} 
                                     target="_blank" 
                                     rel="noreferrer"
                                     className="text-teal-500 hover:text-white transition-colors"
                                     title="View on Google Maps"
                                   >
                                      <ICONS.ExternalLink size={16}/>
                                   </a>
                                </div>
                                <p className="text-xs text-zinc-400 mb-4 line-clamp-3">{loc.description}</p>
                                
                                <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                                   <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Scout Analysis</p>
                                   <p className="text-xs text-zinc-300 italic">"{loc.suitability}"</p>
                                </div>
                             </div>
                          </div>
                       ))}
                       {scoutedLocations.length === 0 && !isScouting && (
                          <div className="col-span-full text-center py-20 text-zinc-600">
                             <ICONS.Globe size={64} className="mx-auto mb-4 opacity-30"/>
                             <h3 className="text-xl font-bold text-zinc-400">Global Location Database</h3>
                             <p className="text-sm max-w-md mx-auto mt-2">Enter your scene requirements above to find real-world filming locations that match your vision.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           )}

           {/* --- RESTORED AUDIO SECTION (MAIN VIEW) --- */}
           {activeTab === 'AUDIO' && (
             <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6 cinematic-font">Audio Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.audioAssets?.map((audio) => (
                    <div key={audio.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex items-center gap-4">
                       <button 
                         className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white hover:bg-amber-500 transition-colors"
                         onClick={() => { const a = new Audio(audio.audioUrl); a.play(); }}
                       >
                          <ICONS.Play size={20} fill="currentColor" />
                       </button>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{audio.text}</p>
                          <p className="text-xs text-zinc-500">{audio.voice}</p>
                       </div>
                       <a href={audio.audioUrl} download={`audio-${audio.id}.wav`} className="text-zinc-500 hover:text-white"><ICONS.Upload size={16} className="rotate-180"/></a>
                    </div>
                  ))}
                  {(!project.audioAssets || project.audioAssets.length === 0) && (
                    <div className="col-span-full text-center text-zinc-600 py-12">
                      <ICONS.Mic size={48} className="mx-auto mb-2 opacity-50"/>
                      <p>No audio clips generated yet.</p>
                    </div>
                  )}
                </div>
             </div>
           )}

           {/* --- RESTORED TRAILER SECTION --- */}
           {activeTab === 'TRAILER' && (
             <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="max-w-4xl mx-auto flex gap-4 items-end">
                       <div className="flex-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Video Prompt</label>
                          <input 
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm"
                            placeholder="Describe the motion, subject, and style for the video clip..."
                            value={videoPrompt}
                            onChange={(e) => setVideoPrompt(e.target.value)}
                          />
                       </div>
                       <Button variant="accent" className="h-[46px] px-6 bg-red-600 hover:bg-red-500" onClick={handleGenerateVideo} isLoading={isGeneratingVideo}>
                          <ICONS.Video size={18} className="mr-2"/> Generate with Veo
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       
                       {/* Upload Card */}
                       <label className="border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] text-zinc-600 hover:text-white group">
                          <ICONS.Upload size={48} className="mb-4 group-hover:scale-110 transition-transform text-zinc-700 group-hover:text-zinc-500"/>
                          <h3 className="font-bold">Upload Video</h3>
                          <p className="text-xs mt-1 opacity-50">MP4, WebM (Max 50MB)</p>
                          <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                       </label>

                       {/* Video Cards */}
                       {project.videos?.map((video) => (
                          <div 
                             key={video.id} 
                             onClick={() => setPlayingVideo(video)}
                             className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-red-600/50 transition-all cursor-pointer relative"
                          >
                             {/* Delete Button Overlay */}
                             {onDeleteVideo && (
                                <button 
                                   onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm("Are you sure you want to delete this video?")) {
                                         onDeleteVideo(video.id);
                                      }
                                   }}
                                   className="absolute top-2 right-2 z-20 p-2 bg-red-600 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                   title="Delete Video"
                                >
                                   <ICONS.Trash2 size={14}/>
                                </button>
                             )}

                             <div className="aspect-video bg-black relative">
                                <video 
                                   src={video.url + "#t=0.5"} 
                                   className="w-full h-full object-cover pointer-events-none"
                                   muted
                                   preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                                      <ICONS.Play size={24} fill="currentColor" />
                                   </div>
                                </div>
                                {video.source === 'AI' && (
                                   <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase tracking-wider">Veo AI</div>
                                )}
                             </div>
                             <div className="p-4">
                                <h3 className="font-bold text-white text-sm truncate">{video.title}</h3>
                                <p className="text-xs text-zinc-500 mt-1">{new Date(video.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
             </div>
           )}

        </main>
      </div>
    </div>
  );
};
