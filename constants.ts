import { 
  Clapperboard, 
  Layout, 
  Palette, 
  Play, 
  Plus, 
  Save, 
  Trash2, 
  Upload, 
  Wand2, 
  Move, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Film, 
  Grid, 
  FileText, 
  Languages, 
  Video, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Briefcase, 
  Activity, 
  Users, 
  Rocket, 
  Music, 
  Camera, 
  RectangleHorizontal, 
  RectangleVertical, 
  Square, 
  Layers, 
  Brush, 
  Tv, 
  Eye, 
  EyeOff,
  ArrowRight, 
  ArrowUp, 
  ZoomIn, 
  Vibrate, 
  Aperture, 
  ShieldCheck, 
  Zap, 
  Mic, 
  Volume2, 
  MapPin, 
  Globe, 
  BookOpen, 
  Calculator, 
  Coins,
  ExternalLink,
  Check,
  Archive,
  Brain,
  X,
  Download,
  Info,
  RotateCcw,
  ScrollText,
  Sparkles,
  UserPlus,
  Box,
  File,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Key,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { ProjectType, SlideTemplate, ServiceType, StoryStructure } from "./types";

export const ICONS = {
  Clapperboard,
  Layout,
  Palette, 
  Play,
  Plus,
  Save,
  Trash2,
  Upload,
  Wand2,
  Move,
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Image: ImageIcon,
  Type: TypeIcon,
  Film, 
  Grid, 
  FileText, 
  Languages, 
  Video, 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Briefcase, 
  Activity, 
  Users, 
  Rocket, 
  Music, 
  Camera, 
  RectangleHorizontal, 
  RectangleVertical, 
  Square, 
  Layers, 
  Brush, 
  Tv, 
  Eye, 
  EyeOff,
  ArrowRight, 
  ArrowUp, 
  ZoomIn, 
  Vibrate, 
  Aperture, 
  ShieldCheck, 
  Zap, 
  Mic, 
  Volume2, 
  MapPin, 
  Globe, 
  BookOpen, 
  Calculator, 
  Coins,
  ExternalLink,
  Check,
  Archive,
  Brain,
  X,
  Download,
  Info,
  RotateCcw, 
  ScrollText,
  Sparkles,
  UserPlus,
  Box,
  File,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Key,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
};

export const INDIAN_CINEMA_BEATS = [
  { title: "The Hook (Opening Image)", description: "Establish the mood and world." },
  { title: "The Hero Introduction", description: "Mass entry or character establish." },
  { title: "The Inciting Incident", description: "The problem starts." },
  { title: "Plot Point 1", description: "Hero accepts the mission/journey." },
  { title: "The B-Plot Entry", description: "Love interest, comedy track, or sub-plot." },
  { title: "The Midpoint Build-up", description: "Tension rises significantly." },
  { title: "The Interval Block (The Twist)", description: "The shocking cliffhanger." },
  { title: "The Re-Opening", description: "Immediate aftermath of the interval." },
  { title: "The Low Point", description: "Hero fails or loses hope." },
  { title: "The Climax Setup", description: "Preparing for the final battle." },
  { title: "The Grand Climax", description: "Resolution and final confrontation." },
  { title: "The Tail-End (Punch)", description: "Final shot or sequel hint." }
];

export const PLACEHOLDER_IMAGE = "https://picsum.photos/1920/1080";

export const APP_SERVICES = [
  {
    id: ServiceType.PITCH_DECK,
    label: "Pitch Deck Creator",
    icon: Layout,
    desc: "Create comprehensive cinematic pitch decks with AI slides.",
    color: "text-amber-500",
    bgColor: "group-hover:bg-amber-600"
  },
  {
    id: ServiceType.BUDGET_FORGE,
    label: "BudgetForge",
    icon: Calculator,
    desc: "AI Line Producer to estimate costs and breakdowns.",
    color: "text-green-500",
    bgColor: "group-hover:bg-green-600"
  },
  {
    id: ServiceType.CINEMA_VAULT,
    label: "Cinema Vault",
    icon: Box,
    desc: "Securely organize research, files, and assets.",
    color: "text-orange-500",
    bgColor: "group-hover:bg-orange-600"
  },
  {
    id: ServiceType.SCRIPT_MAGIC,
    label: "Script Magic",
    icon: ScrollText,
    desc: "Write, format, and enhance your screenplay with AI assistance.",
    color: "text-indigo-500",
    bgColor: "group-hover:bg-indigo-600"
  },
  {
    id: ServiceType.CAST_CREW,
    label: "Cast & Crew",
    icon: UserPlus,
    desc: "Manage casting, actor profiles, and production crew lists.",
    color: "text-emerald-500",
    bgColor: "group-hover:bg-emerald-600"
  },
  {
    id: ServiceType.STORYBOARD,
    label: "Storyboard Pro",
    icon: Layers,
    desc: "Visualize your script scene-by-scene with AI visuals.",
    color: "text-blue-500",
    bgColor: "group-hover:bg-blue-600"
  },
  {
    id: ServiceType.CHARACTER_LAB,
    label: "Character Lab",
    icon: Users,
    desc: "Design hyper-realistic characters, costumes, and traits.",
    color: "text-purple-500",
    bgColor: "group-hover:bg-purple-600"
  },
  {
    id: ServiceType.LOCATION_SCOUT,
    label: "Location Scout",
    icon: MapPin,
    desc: "Find real-world filming locations and visualize scenes.",
    color: "text-teal-500",
    bgColor: "group-hover:bg-teal-600"
  },
  {
    id: ServiceType.POSTER_LOFT,
    label: "Poster Loft",
    icon: ImageIcon,
    desc: "Generate high-concept movie posters and marketing art.",
    color: "text-green-500",
    bgColor: "group-hover:bg-green-600"
  },
  {
    id: ServiceType.SOUND_STAGE,
    label: "Sound Stage",
    icon: Mic,
    desc: "Generate AI Voiceovers and dialogues for your script.",
    color: "text-pink-500",
    bgColor: "group-hover:bg-pink-600"
  },
  {
    id: ServiceType.TRAILER_GEN,
    label: "Trailer Room",
    icon: Video,
    desc: "Upload or Generate cinematic video clips.",
    color: "text-red-500",
    bgColor: "group-hover:bg-red-600"
  }
];

export const PROJECT_CATEGORIES = [
  { 
    id: ProjectType.FEATURE_FILM, 
    label: "Feature Film", 
    icon: Film,
    desc: "Full-length cinematic pitch deck" 
  },
  { 
    id: ProjectType.SHORT_FILM, 
    label: "Short Film", 
    icon: Camera,
    desc: "Concise artistic statement" 
  },
  { 
    id: ProjectType.DOCUMENTARY, 
    label: "Documentary", 
    icon: FileText,
    desc: "Real-world stories & facts" 
  },
  { 
    id: ProjectType.STARTUP_PITCH, 
    label: "Startup Pitch", 
    icon: Rocket,
    desc: "Business model & solution" 
  },
  { 
    id: ProjectType.MUSIC_VIDEO, 
    label: "Music Video", 
    icon: Music,
    desc: "Visuals synced to audio" 
  }
];

export const GENRES_BY_CATEGORY = {
  [ProjectType.FEATURE_FILM]: [
    "Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "Western", "Musical", "Noir"
  ],
  [ProjectType.SHORT_FILM]: [
    "Drama", "Comedy", "Horror", "Experimental", "Animation", "Social Awareness", "Thriller"
  ],
  [ProjectType.DOCUMENTARY]: [
    "Nature / Wildlife", "History", "Biography", "True Crime", "Social Issue", "Science & Tech", "Travel", "Politics", "Music"
  ],
  [ProjectType.STARTUP_PITCH]: [
    "Technology (SaaS)", "Fintech", "HealthTech", "E-commerce", "EdTech", "GreenTech / Sustainability", "AI / ML", "Consumer App", "Hardware"
  ],
  [ProjectType.MUSIC_VIDEO]: [
    "Pop", "Hip Hop / Rap", "Rock", "Indie / Alternative", "Electronic / EDM", "R&B", "Classical", "Folk", "Metal"
  ]
};

export const SLIDE_TEMPLATES_BY_TYPE: Record<ProjectType, SlideTemplate[]> = {
  [ProjectType.FEATURE_FILM]: [
    { title: "Title Poster", description: "The visual face of your film", placeholderText: "Title, Tagline, and a striking key visual." },
    { title: "Logline & Hook", description: "The elevator pitch", placeholderText: "A one-sentence summary that hooks the reader instantly." },
    { title: "Story Synopsis", description: "The narrative arc", placeholderText: "A compelling summary of the plot (Act 1, 2, 3)." },
    { title: "Hero Character", description: "Protagonist details", placeholderText: "Name, Age, Core Desire, and Flaw." },
    { title: "Antagonist", description: "The villain or force of opposition", placeholderText: "Who stops the hero? What do they want?" },
    { title: "Key Supporting Cast", description: "Allies and mentors", placeholderText: "Brief descriptions of 2-3 other key characters." },
    { title: "Visual Style", description: "Cinematography & tone", placeholderText: "Lighting, color palette, camera movement, and mood." },
    { title: "Key Scenes", description: "Signature moments", placeholderText: "Describe 3 unforgettable visual moments from the film." },
    { title: "Theme & Tone", description: "Emotional core", placeholderText: "What is the film really about? (Love, Revenge, Survival?)" },
    { title: "Story World", description: "Setting & locations", placeholderText: "Where does it take place? What makes the world unique?" },
    { title: "Director's Vision", description: "Why this film?", placeholderText: "Your personal connection and directorial approach." },
    { title: "Moodboard", description: "Visual collage", placeholderText: "Textures, colors, and feelings (Use images mostly)." },
    { title: "Target Audience", description: "Who will watch this?", placeholderText: "Demographics, psychographics, and similar film fans." },
    { title: "Comparable Films", description: "Market references", placeholderText: "Film A meets Film B." },
    { title: "Budget & ROI", description: "Financial overview", placeholderText: "Estimated budget and potential box office returns." },
    { title: "Production Timeline", description: "Schedule", placeholderText: "Pre-production, Shooting, and Post-production dates." },
    { title: "Marketing Strategy", description: "Distribution plan", placeholderText: "Festivals, Theatrical release, OTT strategy." },
    { title: "Team Profiles", description: "Key crew", placeholderText: "Writer, Director, Producer bios." },
    { title: "Music & Sound", description: "Auditory landscape", placeholderText: "Score style, key songs, sound design notes." },
    { title: "End Credits", description: "Contact info", placeholderText: "Production company contact details and rights info." }
  ],
  [ProjectType.SHORT_FILM]: [
    { title: "Title Card", description: "Film Identity", placeholderText: "Title and Tagline." },
    { title: "Concept & Theme", description: "Core Idea", placeholderText: "The central metaphor or message." },
    { title: "Character Study", description: "Protagonist", placeholderText: "Who are we following?" },
    { title: "Visual Aesthetic", description: "Look & Feel", placeholderText: "Camera style and color grading." },
    { title: "Script Summary", description: "Plot", placeholderText: "Beginning, Middle, End." },
    { title: "Distribution Plan", description: "Festival Circuit", placeholderText: "Target festivals and online platforms." },
    { title: "Budget Estimation", description: "Cost breakdown", placeholderText: "Production costs and funding sources." }
  ],
  [ProjectType.DOCUMENTARY]: [
    { title: "Title & Subject", description: "The Topic", placeholderText: "What is this documentary about?" },
    { title: "The 'Why Now?'", description: "Relevance", placeholderText: "Why does this story need to be told today?" },
    { title: "Subject Access", description: "Feasibility", placeholderText: "Who are you interviewing? Do you have access?" },
    { title: "Narrative Arc", description: "Story structure", placeholderText: "How will the story unfold?" },
    { title: "Visual Approach", description: "Style", placeholderText: "Observational, Archival, Re-enactment?" },
    { title: "Impact Campaign", description: "Social Goal", placeholderText: "What change do you want to create?" },
    { title: "Budget & Funding", description: "Financials", placeholderText: "Grant requirements and total budget." }
  ],
  [ProjectType.STARTUP_PITCH]: [
    { title: "Cover Slide", description: "Company Intro", placeholderText: "Logo and One-liner." },
    { title: "The Problem", description: "Pain Point", placeholderText: "What is broken in the market?" },
    { title: "The Solution", description: "Product/Service", placeholderText: "How do you solve it?" },
    { title: "Market Size", description: "TAM/SAM/SOM", placeholderText: "How big is the opportunity?" },
    { title: "Business Model", description: "Revenue", placeholderText: "How do you make money?" },
    { title: "Competition", description: "Landscape", placeholderText: "Who else is doing this? Why are you better?" },
    { title: "Go-to-Market", description: "Strategy", placeholderText: "How will you get customers?" },
    { title: "Team", description: "Founders", placeholderText: "Why are you the right team?" },
    { title: "Financial Projections", description: "Growth", placeholderText: "Revenue goals for next 3-5 years." }
  ],
  [ProjectType.MUSIC_VIDEO]: [
    { title: "Track Title & Artist", description: "Song Info", placeholderText: "Artist name and Track title." },
    { title: "Concept Note", description: "Core Idea", placeholderText: "The visual hook." },
    { title: "Lyrics & Themes", description: "Interpretation", placeholderText: "Key lyrics and their visual meaning." },
    { title: "Visual References", description: "Inspiration", placeholderText: "Images that inspire the look." },
    { title: "Color Palette", description: "Colors", placeholderText: "Primary and secondary colors." },
    { title: "Styling & Costume", description: "Wardrobe", placeholderText: "Look for the artist/actors." },
    { title: "Locations", description: "Settings", placeholderText: "Where will it be shot?" },
    { title: "Production Timeline", description: "Schedule", placeholderText: "Shoot dates and edit deadline." }
  ]
};

export const STORY_STRUCTURES: StoryStructure[] = [
  {
    id: "HERO_JOURNEY",
    name: "The Hero's Journey (Monomyth)",
    beats: [
      { title: "1. Ordinary World", description: "Hero in their normal life, unaware of the adventure." },
      { title: "2. Call to Adventure", description: "The catalyst or disruption that offers a challenge." },
      { title: "3. Refusal of the Call", description: "Hero hesitates due to fear or insecurity." },
      { title: "4. Meeting the Mentor", description: "Hero gains advice, training, or a magical gift." },
      { title: "5. Crossing the Threshold", description: "Hero leaves their known world for the unknown." },
      { title: "6. Tests, Allies, Enemies", description: "Exploring the new world, making friends and foes." },
      { title: "7. Approach to Inmost Cave", description: "Preparing for the major challenge." },
      { title: "8. The Ordeal", description: "High stakes crisis, facing death or greatest fear." },
      { title: "9. Reward (Seizing the Sword)", description: "Hero claims the prize or insight." },
      { title: "10. The Road Back", description: "The consequences of the ordeal, potential chase." },
      { title: "11. Resurrection", description: "Final test, hero is reborn/transformed." },
      { title: "12. Return with Elixir", description: "Hero returns home changed, bringing value back." }
    ]
  },
  {
    id: "INDIAN_COMMERCIAL",
    name: "Indian Commercial (Mass Masala)",
    beats: [
      { title: "1. Hero Introduction", description: "Grand entry, establishing power or charm." },
      { title: "2. The World & Conflict", description: "Establishing the setting and the social injustice." },
      { title: "3. Love Interest Entry", description: "Romantic subplot initiation." },
      { title: "4. The Trigger", description: "Personal loss or challenge that motivates the hero." },
      { title: "5. Interval Block", description: "Major twist or high-stakes confrontation. Cliffhanger." },
      { title: "6. Flashback / Backstory", description: "Explaining the hero's past or motivation." },
      { title: "7. Rise of the Villain", description: "Antagonist gains upper hand." },
      { title: "8. Low Point", description: "Hero is defeated or isolated." },
      { title: "9. The Comeback", description: "Hero gears up for the final fight." },
      { title: "10. Climax", description: "Epic battle and resolution of justice." }
    ]
  },
  {
    id: "SIMPLE_3_ACT",
    name: "Simple 3-Act Structure",
    beats: [
      { title: "Act 1: Setup", description: "Introduction to characters and the problem." },
      { title: "Inciting Incident", description: "The event that starts the story." },
      { title: "Act 2: Confrontation", description: "Rising action, obstacles, and failures." },
      { title: "Midpoint", description: "A major shift in the story's direction." },
      { title: "Act 3: Resolution", description: "The climax and the new normal." }
    ]
  }
];

export const ROLE_TYPES = [
  "Protagonist (Hero)",
  "Antagonist (Villain)",
  "Supporting Character",
  "Love Interest",
  "Mentor / Guide",
  "Comic Relief",
  "Extra / Background"
];

export const CHARACTER_STYLES = [
  "Photorealistic Cinematic",
  "3D Pixar/Disney Style",
  "2D Anime / Manga",
  "Hand-Drawn Sketch",
  "Oil Painting",
  "Cyberpunk / Sci-Fi",
  "Fantasy RPG Concept",
  "Noir Black & White",
  "Claymation Style",
  "Watercolor Illustration"
];

// NEW STORYBOARD STYLES
export const STORYBOARD_STYLES = [
  "Hyper Realistic",
  "Digital Painting",
  "3D Render (Pixar/Disney)",
  "Charcoal Sketch",
  "Ink Illustration (Graphic Novel)",
  "Watercolor Concept",
  "Anime Style",
  "Pencil Sketch (Loose)",
  "Blueprint / Technical",
  "Minimalist Vector"
];

// NEW POSTER CONSTANTS
export const POSTER_COMPOSITIONS = [
  "Center Hero (Focus on Protagonist)",
  "Floating Heads (Ensemble Cast)",
  "Minimalist Symbolism (Iconic)",
  "Double Exposure (Character + Landscape)",
  "Action Collage (Dynamic)",
  "Negative Space (Horror/Thriller)",
  "Back Turned (Mystery)"
];

export const COLOR_PALETTES = [
  "Teal & Orange (Blockbuster)",
  "Neon & Cyber (Sci-Fi/Action)",
  "Black & White with Red (Sin City style)",
  "Desaturated / Gritty (War/Drama)",
  "Pastel & Soft (Romance/Indie)",
  "High Contrast / Chiaroscuro (Noir)",
  "Vibrant & Saturated (Animation/Comedy)",
  "Sepia / Vintage (Period Piece)"
];

// NEW CONSTANTS FOR CHARACTER LAB
export const FACE_SHAPES = ["Square", "Oval", "Heart", "Diamond", "Round"];

export const SKIN_TEXTURES = [
  "Porcelain / Flawless", 
  "Freckled", 
  "Weathered (Sun damaged)", 
  "Wrinkled / Aged", 
  "Scarred / Battle-worn", 
  "Oily / Sweaty",
  "Rough / Textured",
  "Tattooed"
];

export const BODY_TYPES = [
  "Ectomorph (Lean / Lanky)", 
  "Mesomorph (Muscular / Athletic)", 
  "Endomorph (Soft / Round)",
  "Average Build",
  "Heavy Set"
];

export const EXPRESSIONS = [
  "Stoic (No emotion)", 
  "Manic / Crazy", 
  "Suspicious / Glaring", 
  "Grief-stricken", 
  "Flirtatious / Smirking", 
  "Determined / Intense", 
  "Joyful / Radiant", 
  "Terrified / Shocked",
  "Melancholic",
  "Rage / Screaming"
];

export const EYE_GAZES = [
  "Direct to Lens (Breaking 4th Wall)", 
  "Looking Off-Camera (Candid)", 
  "Wide-Eyed (Fear/Surprise)", 
  "Squinting (Suspicion/Bright)", 
  "Heavy-Lidded (Tired/Seductive)", 
  "Closed Eyes",
  "Looking Up (Hope/Despair)"
];

export const POSTER_RATIOS = [
  { label: "Portrait", value: "2:3", icon: RectangleVertical },
  { label: "Landscape", value: "16:9", icon: RectangleHorizontal },
  { label: "Square", value: "1:1", icon: Square }
];

export const DIRECTOR_STYLES = [
  "Christopher Nolan (IMAX scale, Practical effects, Time manipulation)",
  "Wes Anderson (Symmetry, Pastel Palette, Flat composition)",
  "Satyajit Ray (Humanism, Natural lighting, Realistic composition)",
  "S.S. Rajamouli (Grandeur, Epic scale, Mythic lighting)",
  "Mani Ratnam (Silhouette lighting, Realistic textures, Intimate grandeur)",
  "Quentin Tarantino (Crash zooms, Low angles, Vibrant colors)",
  "Roger Deakins (Cinematographer - Silhouettes, Practical lighting)",
  "Zack Snyder (High contrast, Slow motion, Speed ramping)",
  "Ridley Scott (Atmospheric, Smoke/Haze, High detail)",
  "Denis Villeneuve (Brutalist architecture, Minimalist, Scale)",
  "Wong Kar-wai (Step-printing, Neon, Motion blur, Intimacy)",
  "Steven Spielberg (Backlighting, Wonder, Smooth tracking)",
  "Lijo Jose Pellissery (Chaos, Long takes, Crowd dynamics)",
  "Amal Neerad (Slow motion, Stylish framing, High contrast)",
  "Anjali Menon (Warm tones, Naturalistic, Emotional intimacy)",
  "Stanley Kubrick (One-point perspective, Clinical detachment)",
  "Tim Burton (Gothic, German Expressionism, Whimsical dark)",
  "David Fincher (Low key lighting, Green/Yellow tint, Controlled)",
  "Greta Gerwig (Warmth, Soft focus, Emotional framing)",
  "Bong Joon-ho (Sharp focus, Genre-bending, Dynamic staging)"
];

export const VISUAL_STYLES = [
  "The Matrix (Green tint, Cyberpunk, High tech)",
  "John Wick (Neon noir, Wet streets, High contrast)",
  "Gladiator (Golden hour, Dust, Epic scale)",
  "300 (High contrast, Desaturated, Graphic novel look)",
  "Blade Runner 2049 (Neon fog, Orange/Teal, Brutalist)",
  "Mad Max: Fury Road (Saturated Orange/Blue, High octane)",
  "The Godfather (Warm, Top lighting, Shadows)",
  "Inception (Clean, Modern, Architectural, Mind-bending)",
  "Her (Soft, Warm, Pastel, Near-future)",
  "Sin City (Black & White, Splash of color, Comic book)",
  "La La Land (Vibrant primaries, Dreamy, Technicolor homage)",
  "Dune (Monochromatic, Sand, Scale, Atmospheric)",
  "Moonlight (High contrast, Vibrant skin tones, Neon)",
  "Joker (Gritty, Urban decay, Green/Orange fluorescent)",
  "Barbie (Saturated Pink/Blue, Plastic textures, High Key)",
  "Oppenheimer (Desaturated, High Contrast B&W + Color, Grainy)",
  "Interstellar (Deep space blacks, Realistic textures, IMAX aspect)",
  "Amelie (Saturated Green/Red, Warm, Magical Realism)",
  "Kill Bill (Yellow/Black, High Contrast, Anime-influenced)",
  "Grand Budapest Hotel (Pastel Pink/Blue, Flat lighting)",
  "Seven (Bleach bypass, High contrast, Grimy/Wet)",
  "Tron Legacy (Neon Blue/Orange, High contrast black)",
  "Avatar (Bioluminescent, Vibrant Jungle, High Saturation)"
];

// CINEMATOGRAPHY CONSTANTS
export const SHOT_SIZES = [
  { id: 'XCU', label: 'XCU (Extreme Close Up)', icon: ZoomIn },
  { id: 'CU', label: 'CU (Close Up)', icon: User },
  { id: 'MCU', label: 'MCU (Medium Close Up)', icon: User },
  { id: 'COWBOY', label: 'Cowboy (Mid-Thigh)', icon: User },
  { id: 'FULL', label: 'Full Shot (Head to Toe)', icon: User },
  { id: 'WIDE', label: 'Wide / Master', icon: Grid }
];

export const CAMERA_ANGLES = [
  { id: 'EYE', label: 'Eye Level (Neutral)' },
  { id: 'LOW', label: 'Low Angle (Heroic)' },
  { id: 'HIGH', label: 'High Angle (Vulnerable)' },
  { id: 'DUTCH', label: 'Dutch Tilt (Unease)' },
  { id: 'OVERHEAD', label: 'Bird\'s Eye (God view)' }
];

export const CAMERA_MOVEMENTS = [
  { id: 'STATIC', label: 'Static (No Move)', icon: Square },
  { id: 'PAN', label: 'Pan (L/R)', icon: ArrowRight },
  { id: 'TILT', label: 'Tilt (U/D)', icon: ArrowUp },
  { id: 'DOLLY', label: 'Dolly / Track', icon: Move },
  { id: 'ZOOM', label: 'Zoom In/Out', icon: ZoomIn },
  { id: 'HANDHELD', label: 'Handheld', icon: Vibrate }
];

export const LENS_TYPES = [
  { id: '14mm', label: '14mm (Ultra Wide)', desc: 'Distorted, Epic' },
  { id: '24mm', label: '24mm (Wide)', desc: 'Landscape, Context' },
  { id: '35mm', label: '35mm (Standard)', desc: 'Human Eye' },
  { id: '50mm', label: '50mm (Portrait)', desc: 'Neutral, Realistic' },
  { id: '85mm', label: '85mm (Telephoto)', desc: 'Flattering, Compressed' },
  { id: '200mm', label: '200mm (Zoom)', desc: 'Isolated, Flat' }
];

export const VOICE_OPTIONS = [
  { id: 'Puck', label: 'Puck (Male, Playful)', gender: 'Male' },
  { id: 'Charon', label: 'Charon (Male, Deep)', gender: 'Male' },
  { id: 'Kore', label: 'Kore (Female, Calm)', gender: 'Female' },
  { id: 'Fenrir', label: 'Fenrir (Male, Intense)', gender: 'Male' },
  { id: 'Aoede', label: 'Aoede (Female, Expressive)', gender: 'Female' }
];

export const DICTIONARY = {
  en: {
    startProject: "Start Project",
    movieTitle: "Project Title",
    genre: "Genre / Category",
    director: "Creator Name",
    logline: "Logline / One-Liner",
    fullScript: "Full Script / Business Plan",
    uploadScript: "Upload File",
    structureTitle: "Structure Your Pitch",
    openStudio: "Open Studio",
    slideTitle: "Slide Title",
    action: "Action",
    addNewSlide: "Add New Slide",
    save: "Save",
    presentDeck: "Present Deck",
    slideDeck: "SLIDE DECK",
    storyBoard: "STORY BOARD",
    mediaLibrary: "TRAILER ROOM",
    characters: "CHARACTER LAB",
    posters: "POSTER LOFT",
    soundStage: "SOUND STAGE",
    locationScout: "Location Scout",
    scriptMagic: "Script Magic",
    castCrew: "Cast & Crew",
    cinemaVault: "Cinema Vault",
    budgetForge: "BudgetForge", // NEW
    addSlide: "Add Slide",
    textContent: "Text Content",
    aiWrite: "AI Write",
    visualAsset: "Visual Asset",
    aiPrompt: "AI Image Prompt",
    generateImage: "Generate Image",
    orUpload: "Or Upload",
    chooseFile: "Choose File",
    directorStyle: "Director / Visual Style",
    visualReference: "Visual Reference",
    generating: "Generating...",
    previewMode: "Preview Mode",
    resume: "Resume Last Project",
    uploadPlaceholder: "Paste your story here or upload a file...",
    addNextScene: "Add Next Scene (+)",
    usePrompt: "Use This Prompt",
    sceneHeading: "Scene Heading",
    plotAction: "Action / Plot",
    visualNote: "Visual Note",
    generateTrailer: "Generate AI Trailer",
    trailerPrompt: "Trailer Visual Description",
    myProfile: "My Profile",
    adminDashboard: "Admin Dashboard",
    logout: "Logout",
    helpFaq: "Help & FAQ",
    selectCategory: "Select Project Category",
    backToCategories: "Back to Categories",
    selectService: "What would you like to create?",
    quickStart: "Quick Start",
    generateAudio: "Generate Audio",
    voicePrompt: "Dialogue / Narration Text",
    // Budget
    industryParam: "Industry Scale",
    scaleParam: "Budget Scale",
    daysParam: "Shooting Days",
    currencyToggle: "Currency",
    calculateBtn: "Calculate Estimate",
    totalBudgetTitle: "Total Estimated Budget",
    riskTitle: "AI Risk Analysis",
    aboveLineTitle: "Above The Line (Creative)",
    belowLineTitle: "Below The Line (Production)",
    printBtn: "Save / Print Estimate",
    // Poster Keys
    posterComposition: "Layout / Composition",
    posterPalette: "Color Palette",
    styleRef: "Style Reference Image",
  },
  ml: {
    startProject: "പ്രോജക്റ്റ് തുടങ്ങുക",
    movieTitle: "പ്രോജക്റ്റ് പേര്",
    genre: "തരം / ജേണർ",
    director: "സ്രഷ്ടാവ്",
    logline: "കഥാസാരം / ആശയം",
    fullScript: "മുഴുവൻ വിവരണം / തിരക്കഥ",
    uploadScript: "ഫയൽ അപ്‌ലോഡ്",
    structureTitle: "പിച്ച് ഡെക്ക് ഘടന",
    openStudio: "സ്റ്റുഡിയോ തുറക്കൂ",
    slideTitle: "സ്ലൈഡ് തലക്കെട്ട്",
    action: "പ്രവർത്തി",
    addNewSlide: "പുതിയ സ്ലൈഡ് ചേർക്കൂ",
    save: "സേവ് ചെയ്യുക",
    presentDeck: "പ്രസന്റേഷൻ",
    slideDeck: "സ്ലൈഡ് ഡെക്ക്",
    storyBoard: "സ്റ്റോറി ബോർഡ്",
    mediaLibrary: "ട്രെയിലർ റൂം",
    characters: "കഥാപാത്രങ്ങൾ",
    posters: "പോസ്റ്റർ ഡിസൈൻ",
    soundStage: "ശബ്ദ സ്റ്റുഡിയോ",
    locationScout: "ലൊക്കേഷൻ സ്കൗട്ട്",
    scriptMagic: "തിരക്കഥ മാജിക്",
    castCrew: "താരങ്ങളും അണിയറക്കാരും",
    cinemaVault: "സിനിമ വോൾട്ട്",
    budgetForge: "ബജറ്റ് ഫോർജ് (എസ്റ്റിമേറ്റ്)", // NEW
    addSlide: "സ്ലൈഡ് ചേർക്കുക",
    textContent: "ഉള്ളടക്കം (Text)",
    aiWrite: "AI എഴുതുക",
    visualAsset: "ദൃശ്യങ്ങൾ (Visuals)",
    aiPrompt: "AI ഇമേജ് വിവരണം",
    generateImage: "ചിത്രം സൃഷ്ടിക്കുക",
    orUpload: "അല്ലെങ്കിൽ അപ്‌ലോഡ്",
    chooseFile: "ഫയൽ തിരഞ്ഞെടുക്കൂ",
    directorStyle: "സംവിധാന ശൈലി",
    visualReference: "ദൃശ്യ മാതൃക",
    generating: "നിർമ്മിക്കുന്നു...",
    previewMode: "പ്രിവ്യൂ മോഡ്",
    resume: "മുമ്പത്തെ പ്രോജക്റ്റ് തുടരുക",
    uploadPlaceholder: "വിവരണം ഇവിടെ പേസ്റ്റ് ചെയ്യുക അല്ലെങ്കിൽ ഫയൽ അപ്‌ലോഡ് ചെയ്യുക...",
    addNextScene: "അടുത്ത സീൻ ചേർക്കുക (+)",
    usePrompt: "ഈ വിവരണം ഉപയോഗിക്കുക",
    sceneHeading: "സീൻ തലക്കെട്ട്",
    plotAction: "പ്രവർത്തി / കഥാസന്ദർഭം",
    visualNote: "ദൃശ്യ വിവരണം",
    generateTrailer: "AI ട്രെയിലർ നിർമ്മിക്കുക",
    trailerPrompt: "ട്രെയിലർ വിവരണം",
    myProfile: "എന്റെ പ്രൊഫൈൽ",
    adminDashboard: "അഡ്മിൻ ഡാഷ്ബോർഡ്",
    logout: "ലോഗൗട്ട്",
    helpFaq: "സഹായം / FAQ",
    selectCategory: "വിഭാഗം തിരഞ്ഞെടുക്കുക",
    backToCategories: "തിരികെ പോവുക",
    selectService: "നിങ്ങൾക്ക് എന്താണ് നിർമ്മിക്കേണ്ടത്?",
    quickStart: "വേഗത്തിൽ തുടങ്ങുക",
    generateAudio: "ശബ്ദം സൃഷ്ടിക്കുക",
    voicePrompt: "സംഭാഷണം / വിവരണം",
    // Budget
    industryParam: "സിനിമ മേഖല",
    scaleParam: "ബജറ്റ് സ്കെയിൽ",
    daysParam: "ഷൂട്ടിംഗ് ദിവസങ്ങൾ",
    currencyToggle: "കറൻസി",
    calculateBtn: "എസ്റ്റിമേറ്റ് കണക്കാക്കുക",
    totalBudgetTitle: "ആകെ ബജറ്റ്",
    riskTitle: "റിസ്ക് അനാലിസിസ്",
    aboveLineTitle: "അബ് എ ലൈൻ (ക്രിയേറ്റീവ്)",
    belowLineTitle: "ബിലോ എ ലൈൻ (പ്രൊഡക്ഷൻ)",
    printBtn: "പ്രിന്റ് ചെയ്യുക",
    // Poster Keys
    posterComposition: "ലേഔട്ട് / ഘടന",
    posterPalette: "നിറങ്ങൾ (Palette)",
    styleRef: "സ്റ്റൈൽ റെഫറൻസ് ചിത്രം",
  }
};