
// Global Declarations for CDN Libraries
declare global {
  var html2pdf: any;
  var JSZip: any;
  var saveAs: any;
  
  // File System Access API
  interface Window {
    showSaveFilePicker: (options?: any) => Promise<LocalFileHandle>;
    showOpenFilePicker: (options?: any) => Promise<LocalFileHandle[]>;
  }
}

// Renamed to avoid collision with standard lib 'FileSystemFileHandle'
export interface LocalFileHandle {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<LocalFileSystemWritableFileStream>;
}

interface LocalFileSystemWritableFileStream extends WritableStream {
  write: (data: any) => Promise<void>;
  close: () => Promise<void>;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER'; // Basic RBAC
  credits: number;
  avatar?: string;
  phone?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export enum ProjectType {
  FEATURE_FILM = 'FEATURE_FILM',
  SHORT_FILM = 'SHORT_FILM',
  DOCUMENTARY = 'DOCUMENTARY',
  STARTUP_PITCH = 'STARTUP_PITCH',
  MUSIC_VIDEO = 'MUSIC_VIDEO'
}

export enum ServiceType {
  PITCH_DECK = 'PITCH_DECK',
  STORYBOARD = 'STORYBOARD',
  CHARACTER_LAB = 'CHARACTER_LAB',
  POSTER_LOFT = 'POSTER_LOFT',
  TRAILER_GEN = 'TRAILER_GEN',
  SOUND_STAGE = 'SOUND_STAGE',
  LOCATION_SCOUT = 'LOCATION_SCOUT',
  SCRIPT_MAGIC = 'SCRIPT_MAGIC',
  CAST_CREW = 'CAST_CREW',
  CINEMA_VAULT = 'CINEMA_VAULT',
  BUDGET_FORGE = 'BUDGET_FORGE'
}

export interface Character {
  id: string;
  name: string;
  role: string; // Display title e.g. "The Protagonist"
  roleType: 'Protagonist' | 'Antagonist' | 'Supporting' | 'Extra';
  description: string;
  // Physical Attributes
  gender: string;
  age: string;
  skinTone: string;
  hairStyle: string;
  clothing: string;
  accessories: string;
  // New Physical Details
  faceShape?: string;
  skinTexture?: string;
  bodyType?: string;
  // Background
  nationality: string;
  era: string; // e.g. "1980s", "Cyberpunk Future"
  // Performance / Acting
  expression?: string;
  eyeGaze?: string;
  // Visuals
  aspectRatio: '1:1' | '16:9' | '9:16' | '2:3';
  visualPrompt: string;
  imageUrl: string | null;
  referenceImageUrl: string | null; // FACE / IDENTITY REF
  actionReferenceImageUrl?: string | null; // BODY / POSE REF
}

// New Interface for Cast & Crew
export interface CastMember {
  id: string;
  characterName: string;
  characterImage: string | null;
  actorName: string;
  actorImage: string | null;
}

export interface CrewMember {
  id: string;
  role: string;
  name: string;
}

// New Interface for Cinema Vault
export type VaultItemType = 'IMAGE' | 'VIDEO' | 'PDF' | 'TEXT' | 'ARCHIVE' | 'AUDIO' | 'UNKNOWN';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  description: string;
  url: string; // Blob URL or Base64
  fileName: string;
  fileSize: string;
  createdAt: number;
}

export interface Poster {
  id: string;
  title: string;
  tagline: string;
  style: string;
  aspectRatio: '2:3' | '16:9' | '1:1';
  prompt: string;
  imageUrl: string | null;
  // Consistency fields
  characterRefId?: string; // Link to an existing Character
  referenceImageUrl?: string | null; // Direct reference image for the poster
}

export interface AudioAsset {
  id: string;
  text: string;
  voice: string;
  audioUrl: string;
  createdAt: number;
}

export interface VideoAsset {
  id: string;
  title: string;
  url: string; // Blob URL or Base64
  createdAt: number;
  source: 'UPLOAD' | 'AI';
}

export interface StoryStructure {
  id: string;
  name: string;
  beats: { title: string; description: string }[];
}

// Location Scout Interfaces
export interface LocationAsset {
  id: string;
  name: string; // Real world name
  description: string;
  coordinates?: string; // Lat,Lng or query
  suitability: string; // Why it fits
  imageUrl?: string | null; // AI Visualization
}

// Script Magic Interfaces
export interface ScriptBeat {
  id: string;
  title: string;
  description: string; // General description of the beat
  aiSuggestion?: string; // The generated summary for this specific story
  isExpanded: boolean; // UI state
}

export interface TwistOption {
  type: 'Classic' | 'Emotional' | 'Wildcard';
  title: string;
  content: string;
}

// Budget Forge Interfaces
export interface BudgetLineItem {
  id: string;
  category: 'Above The Line' | 'Below The Line' | 'Post-Production' | 'Marketing/Distribution' | 'Contingency';
  item: string;
  cost: number;
  notes?: string;
}

export interface ProjectInfo {
  title: string;
  genre: string;
  logline: string;
  director: string;
  language: 'en' | 'ml';
  fullScript: string;
  storyConcept?: string; // The 20-line seed
  scriptRoadmap?: ScriptBeat[]; // The 12-point beat sheet
  projectType: ProjectType;
  serviceType: ServiceType;
  showcaseScenes?: ShowcaseScene[];
  characters?: Character[];
  posters?: Poster[];
  audioAssets?: AudioAsset[];
  videos?: VideoAsset[];
  locations?: LocationAsset[];
  castList?: CastMember[];
  crewList?: CrewMember[];
  vaultItems?: VaultItem[];
  // Budget
  budgetItems?: BudgetLineItem[];
  budgetCurrency?: 'INR' | 'USD';
  budgetScale?: 'Micro/Indie' | 'Mid-Range' | 'Blockbuster';
}

// Updated ShowcaseScene to act as StoryboardShot
export interface ShowcaseScene {
  id: string;
  heading: string;
  action: string;
  visualPrompt: string;
  imageUrl?: string | null;
  // Cinematic Metadata
  shotSize?: string; // e.g., 'XCU', 'Wide'
  cameraAngle?: string; // e.g., 'Low Angle'
  lensType?: string; // e.g., '14mm Wide'
  duration?: string; // e.g., '00:05'
  // New Visual Fields
  imageStyle?: string; // e.g. 'Hyper Realistic', '3D'
  colorGrade?: string; // e.g. 'Matrix Style', 'Joker Style'
  // New History Field
  generatedVariants?: string[];
  // Casting Fields
  characterRef1Id?: string;
  characterRef2Id?: string;
}

export interface SlideTemplate {
  title: string;
  description: string;
  placeholderText: string;
}

export interface Slide {
  id: string;
  title: string;
  description?: string; // Brief instructional text
  placeholder?: string; // Input placeholder text for guidance
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
  isCustom?: boolean;
}

export enum ViewMode {
  AUTH = 'AUTH',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  SETUP = 'SETUP',
  STRUCTURE = 'STRUCTURE',
  STUDIO = 'STUDIO',
  PRESENTATION = 'PRESENTATION'
}

export type StudioTab = 'DECK' | 'CHARACTERS' | 'STORYBOARD' | 'POSTERS' | 'TRAILER' | 'AUDIO' | 'LOCATION' | 'SCRIPT' | 'CAST_CREW' | 'VAULT' | 'BUDGET';

// Cinema Constants Types
export enum ShotSize {
  XCU = 'Extreme Close Up',
  CU = 'Close Up',
  MCU = 'Medium Close Up',
  COWBOY = 'Cowboy / Med Full',
  FULL = 'Full Shot',
  WIDE = 'Wide / Master'
}

export enum CameraAngle {
  EYE = 'Eye Level',
  LOW = 'Low Angle',
  HIGH = 'High Angle',
  DUTCH = 'Dutch / Canted',
  OVERHEAD = 'Overhead / God\'s Eye'
}

export enum CameraMovement {
  STATIC = 'Static',
  PAN = 'Pan',
  TILT = 'Tilt',
  DOLLY = 'Dolly / Track',
  ZOOM = 'Zoom',
  HANDHELD = 'Handheld / Shaky'
}
