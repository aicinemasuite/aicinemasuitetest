import React, { useState, useEffect } from 'react';
import { SetupView } from './components/SetupView';
import { StructureView } from './components/StructureView';
import { PresentationView } from './components/PresentationView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { AIChatBot } from './components/AIChatBot';
import { ToastContainer } from './components/ToastContainer';
import { FeedbackModal } from './components/FeedbackModal';
import { FAQOverlay } from './components/FAQOverlay';
import { APIKeyModal } from './components/APIKeyModal';
import { BuyCreditsModal } from './components/BuyCreditsModal';
import { ICONS, DICTIONARY, SLIDE_TEMPLATES_BY_TYPE, STORY_STRUCTURES } from './constants';
import { ProjectInfo, Slide, ViewMode, StudioTab, ToastMessage, UserProfile, ProjectType, ServiceType } from './types';
import { ProjectIO } from './services/ProjectIO';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();

  // Local State (Preserved from original)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SETUP);
  const [project, setProject] = useState<ProjectInfo>({
    title: "",
    genre: "",
    logline: "",
    director: "",
    language: 'en',
    fullScript: "",
    projectType: ProjectType.FEATURE_FILM,
    serviceType: ServiceType.PITCH_DECK,
    showcaseScenes: [],
    characters: [],
    posters: [],
    audioAssets: [],
    videos: [],
    locations: [],
    castList: [],
    crewList: [],
    vaultItems: [],
    budgetItems: [],
    budgetCurrency: 'INR',
    budgetScale: 'Mid-Range'
  });

  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('DECK');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [savedFileHandle, setSavedFileHandle] = useState<any>(null);

  // Check for API Key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey && viewMode === ViewMode.STUDIO) {
      setShowApiKeyModal(true);
    }
  }, [viewMode]);

  // Auto-save project
  useEffect(() => {
    if (viewMode === ViewMode.STUDIO && slides.length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem('cinepitch_autosave', JSON.stringify({ project, slides, activeSlideId }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [project, slides, activeSlideId, viewMode]);

  // Resume saved project
  useEffect(() => {
    const saved = localStorage.getItem('cinepitch_autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.project && data.slides) {
          // Don't auto-resume, just mark as available
        }
      } catch (e) {
        console.error("Failed to parse saved project");
      }
    }
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveApiKey = (key: string) => {
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      addToast({ type: 'success', title: 'API Key Saved', message: 'You can now generate AI content.' });
    } else {
      localStorage.removeItem('gemini_api_key');
      addToast({ type: 'info', title: 'API Key Removed' });
    }
    setShowApiKeyModal(false);
  };

  const handleStartProject = (initialTab: StudioTab) => {
    const templates = SLIDE_TEMPLATES_BY_TYPE[project.projectType] || [];
    const initialSlides: Slide[] = templates.map((template, idx) => ({
      id: `slide-${idx}`,
      title: template.title,
      description: template.description,
      placeholder: template.placeholderText,
      content: "",
      imagePrompt: "",
      imageUrl: null,
      isCustom: false
    }));
    setSlides(initialSlides);
    setActiveSlideId(initialSlides[0]?.id || null);
    setActiveTab(initialTab);
    setViewMode(ViewMode.STUDIO);
  };

  const handleResumeProject = () => {
    const saved = localStorage.getItem('cinepitch_autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProject(data.project);
        setSlides(data.slides);
        setActiveSlideId(data.activeSlideId);
        setViewMode(ViewMode.STUDIO);
      } catch (e) {
        addToast({ type: 'error', title: 'Failed to resume project' });
      }
    }
  };

  const handleLoadFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await ProjectIO.load(file);
      if (result) {
        setProject(result.project);
        setSlides(result.slides);
        setActiveSlideId(result.activeSlideId);
        setViewMode(ViewMode.STUDIO);
        addToast({ type: 'success', title: 'Project Loaded Successfully' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load project', message: 'Invalid file format' });
    }
  };

  const handleResetProject = () => {
    setProject({
      title: "",
      genre: "",
      logline: "",
      director: "",
      language: 'en',
      fullScript: "",
      projectType: ProjectType.FEATURE_FILM,
      serviceType: ServiceType.PITCH_DECK,
      showcaseScenes: [],
      characters: [],
      posters: [],
      audioAssets: [],
      videos: [],
      locations: [],
      castList: [],
      crewList: [],
      vaultItems: [],
      budgetItems: [],
      budgetCurrency: 'INR',
      budgetScale: 'Mid-Range'
    });
    setSlides([]);
    setActiveSlideId(null);
  };

  // Convert AuthScreen user to UserProfile
  const userProfile: UserProfile | null = user && profile ? {
    name: user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: user.email === 'director@studio.com' ? 'ADMIN' : 'USER',
    credits: profile.credits,
    phone: profile.email
  } : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <ICONS.Loader2 size={48} className="animate-spin text-amber-500" />
          <p className="text-zinc-400">Loading Studio...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        {/* Import AuthScreen is handled via existing component - just show a simple login prompt for now */}
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md p-8 bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 text-amber-500">
                <ICONS.Clapperboard size={48} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 cinematic-font tracking-wider">
                AICINEMA<span className="text-amber-500">SUITE</span>.COM
              </h1>
              <p className="text-zinc-400 text-sm tracking-wide">Please configure Supabase credentials in your environment variables to enable authentication.</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-900/50 rounded-lg p-4 text-sm text-amber-200">
              <p className="font-bold mb-2">Setup Required:</p>
              <p className="text-xs mb-2">Add these environment variables:</p>
              <code className="text-xs block bg-black/40 p-2 rounded font-mono">
                VITE_SUPABASE_URL<br/>
                VITE_SUPABASE_ANON_KEY
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      {viewMode === ViewMode.SETUP && (
        <SetupView
          project={project}
          setProject={setProject}
          onStart={handleStartProject}
          onResume={slides.length > 0 ? handleResumeProject : undefined}
          onLoadFromFile={handleLoadFromFile}
          hasSavedProject={!!localStorage.getItem('cinepitch_autosave')}
          step="DETAILS"
          setStep={() => {}}
          onReset={handleResetProject}
        />
      )}

      {viewMode === ViewMode.PROFILE && userProfile && (
        <ProfileView
          onBack={() => setViewMode(ViewMode.SETUP)}
          user={userProfile}
          onUpdateUser={(updates) => {
            // Handle profile updates if needed
          }}
        />
      )}

      {viewMode === ViewMode.ADMIN && userProfile?.role === 'ADMIN' && (
        <AdminView
          project={project}
          setProject={setProject}
          slides={slides}
          setSlides={setSlides}
          onBack={() => setViewMode(ViewMode.SETUP)}
          user={userProfile}
        />
      )}

      {/* Modals */}
      {showApiKeyModal && (
        <APIKeyModal
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyModal(false)}
        />
      )}

      {showBuyCreditsModal && profile && (
        <BuyCreditsModal
          currentCredits={profile.credits}
          onClose={() => setShowBuyCreditsModal(false)}
          onSuccess={() => {
            refreshProfile();
            addToast({ type: 'success', title: 'Credits Added!', message: 'Your credits have been updated.' });
          }}
        />
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showFAQ && <FAQOverlay onClose={() => setShowFAQ(false)} />}

      {/* Global UI Elements */}
      {user && (
        <>
          {/* Credit Balance Display (Top Right) */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
            <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <ICONS.Zap size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-white">{profile?.credits || 0}</span>
              <span className="text-xs text-zinc-500">Credits</span>
              <button
                onClick={() => setShowBuyCreditsModal(true)}
                className="ml-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors"
              >
                Buy
              </button>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user.email?.charAt(0).toUpperCase()}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-3 border-b border-zinc-800">
                  <p className="text-xs text-zinc-500">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <ICONS.Key size={14} /> AI Settings
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <ICONS.LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          <AIChatBot />
        </>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
