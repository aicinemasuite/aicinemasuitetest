import { ProjectInfo, Slide, LocalFileHandle } from "../types";

// Helper to convert Base64 to Blob
const base64ToBlob = (base64: string) => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
};

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export class ProjectIO {
  
  /**
   * Saves the project.
   * If a fileHandle is provided, writes to it directly.
   * If not, attempts to open a "Save As" dialog using File System API.
   * Fallback to classic download if API not supported or blocked.
   */
  static async save(
    project: ProjectInfo, 
    slides: Slide[], 
    activeSlideId: string | null,
    existingHandle?: LocalFileHandle | null
  ): Promise<LocalFileHandle | null> {
    
    if (!window.JSZip) {
      throw new Error("Export libraries (JSZip) not loaded.");
    }

    console.log("ProjectIO: Packaging project...");
    
    // 1. Generate the ZIP Blob (The Content)
    const zipBlob = await ProjectIO.generateProjectZip(project, slides, activeSlideId);
    
    // 2. File System Access API (Smart Save) - ATTEMPT
    try {
        if (existingHandle) {
           console.log("ProjectIO: Saving to existing handle...");
           await ProjectIO.writeFileToHandle(existingHandle, zipBlob);
           return existingHandle;
        } else if (window.showSaveFilePicker) {
           console.log("ProjectIO: Opening Save As dialog...");
           const safeTitle = project.title ? project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : "project";
           
           // Attempt to open the picker
           const handle = await window.showSaveFilePicker({
              suggestedName: `${safeTitle}.cinepitch`,
              types: [{
                 description: 'CinePitch Project File',
                 accept: { 'application/zip': ['.cinepitch'] }
              }]
           });
           
           await ProjectIO.writeFileToHandle(handle, zipBlob);
           return handle;
        }
    } catch (e: any) {
        // If user explicitly cancelled, stop.
        if (e.name === 'AbortError') {
           console.log("Save cancelled by user.");
           return null;
        }
        
        // IF BLOCKED (SecurityError) OR NOT SUPPORTED -> FALLBACK
        console.warn("Smart Save failed (likely iframe/security restriction). Falling back to standard download.", e);
    }

    // 3. Fallback: Classic Download (Works everywhere, even in iframes)
    console.log("ProjectIO: Fallback to download.");
    if (!window.saveAs) throw new Error("FileSaver not loaded");
    
    const safeTitle = project.title ? project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : "project";
    window.saveAs(zipBlob, `${safeTitle}.cinepitch`);
    
    // Return null because we didn't get a file handle for auto-save
    return null;
  }

  private static async writeFileToHandle(handle: LocalFileHandle, blob: Blob) {
     const writable = await handle.createWritable();
     await writable.write(blob);
     await writable.close();
  }

  private static async generateProjectZip(project: ProjectInfo, slides: Slide[], activeSlideId: string | null): Promise<Blob> {
    const zip = new window.JSZip();
    const assetsFolder = zip.folder("assets");
    
    // Clone data to avoid mutating app state
    const cleanProject = JSON.parse(JSON.stringify(project));
    const cleanSlides = JSON.parse(JSON.stringify(slides));
    
    // --- HELPER TO EXTRACT ASSETS ---
    const processAsset = (obj: any, key: string, prefix: string) => {
      // If it is a Data URI
      if (obj[key] && typeof obj[key] === 'string' && obj[key].startsWith('data:')) {
        const extension = obj[key].substring(5, obj[key].indexOf(';')); 
        const ext = extension.split('/')[1];
        const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${ext}`;
        assetsFolder.file(filename, base64ToBlob(obj[key]));
        obj[key] = `asset://${filename}`;
      }
    };

    // Helper for Blob URLs (Videos) 
    const processVideoBlobs = async () => {
       if (cleanProject.videos) {
          for (let i = 0; i < cleanProject.videos.length; i++) {
             const v = cleanProject.videos[i];
             if (v.url && v.url.startsWith('blob:')) {
                try {
                   const response = await fetch(v.url);
                   const blob = await response.blob();
                   const ext = blob.type.split('/')[1] || 'mp4';
                   const filename = `video_${i}_${Date.now()}.${ext}`;
                   assetsFolder.file(filename, blob);
                   v.url = `asset://${filename}`;
                } catch (e) {
                   console.warn("Failed to export video blob", v.url);
                }
             } else if (v.url && v.url.startsWith('data:')) {
                processAsset(v, 'url', `video_${i}`);
             }
          }
       }
    };

    // Process all asset categories
    cleanSlides.forEach((s: any, i: number) => processAsset(s, 'imageUrl', `slide_${i}`));

    if (cleanProject.characters) {
      cleanProject.characters.forEach((c: any, i: number) => {
        processAsset(c, 'imageUrl', `char_${i}`);
        processAsset(c, 'referenceImageUrl', `char_ref_${i}`);
        processAsset(c, 'actionReferenceImageUrl', `char_act_${i}`);
      });
    }

    if (cleanProject.showcaseScenes) {
      cleanProject.showcaseScenes.forEach((s: any, i: number) => {
        processAsset(s, 'imageUrl', `scene_${i}`);
        if (s.generatedVariants) {
           s.generatedVariants = s.generatedVariants.map((v: string, idx: number) => {
              if (v.startsWith('data:')) {
                 const fname = `scene_${i}_var_${idx}.png`;
                 assetsFolder.file(fname, base64ToBlob(v));
                 return `asset://${fname}`;
              }
              return v;
           });
        }
      });
    }

    if (cleanProject.posters) {
      cleanProject.posters.forEach((p: any, i: number) => processAsset(p, 'imageUrl', `poster_${i}`));
    }

    if (cleanProject.castList) {
      cleanProject.castList.forEach((c: any, i: number) => {
        processAsset(c, 'characterImage', `cast_char_${i}`);
        processAsset(c, 'actorImage', `cast_actor_${i}`);
      });
    }
    
    if (cleanProject.vaultItems) {
      cleanProject.vaultItems.forEach((v: any, i: number) => processAsset(v, 'url', `vault_${i}`));
    }
    
    await processVideoBlobs();

    const metadata = {
      version: "3.4",
      timestamp: new Date().toISOString(),
      activeSlideId
    };
    
    zip.file("project.json", JSON.stringify(cleanProject));
    zip.file("slides.json", JSON.stringify(cleanSlides));
    zip.file("meta.json", JSON.stringify(metadata));

    return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  }

  /**
   * Loads a project, re-inflating assets back into Data URIs
   */
  static async load(file: File): Promise<{ project: ProjectInfo, slides: Slide[], activeSlideId: string } | null> {
    if (!window.JSZip) throw new Error("JSZip not found");

    console.log("ProjectIO: Loading Smart Project...");
    const zip = new window.JSZip();
    const loadedZip = await zip.loadAsync(file);

    if (!loadedZip.file("project.json")) {
       throw new Error("Invalid file format (missing project.json)");
    }

    const projectStr = await loadedZip.file("project.json").async("string");
    const slidesStr = await loadedZip.file("slides.json").async("string");
    const metaStr = await loadedZip.file("meta.json").async("string");

    const project = JSON.parse(projectStr);
    const slides = JSON.parse(slidesStr);
    const meta = JSON.parse(metaStr);

    const assetsFolder = loadedZip.folder("assets");

    // --- HELPER TO RESTORE ASSETS ---
    const restoreAsset = async (obj: any, key: string, asBlobUrl = false) => {
      if (obj[key] && typeof obj[key] === 'string' && obj[key].startsWith('asset://')) {
        const filename = obj[key].replace('asset://', '');
        const fileInZip = assetsFolder?.file(filename);
        if (fileInZip) {
          const blob = await fileInZip.async("blob");
          if (asBlobUrl) {
             obj[key] = URL.createObjectURL(blob);
          } else {
             obj[key] = await blobToBase64(blob);
          }
        }
      }
    };

    // Restore all asset categories
    for (const s of slides) await restoreAsset(s, 'imageUrl');

    if (project.characters) {
      for (const c of project.characters) {
        await restoreAsset(c, 'imageUrl');
        await restoreAsset(c, 'referenceImageUrl');
        await restoreAsset(c, 'actionReferenceImageUrl');
      }
    }

    if (project.showcaseScenes) {
      for (const s of project.showcaseScenes) {
        await restoreAsset(s, 'imageUrl');
        if (s.generatedVariants) {
           const restoredVars = [];
           for (const v of s.generatedVariants) {
              if (v.startsWith('asset://')) {
                 const fname = v.replace('asset://', '');
                 const f = assetsFolder?.file(fname);
                 if (f) {
                   const b = await f.async("blob");
                   restoredVars.push(await blobToBase64(b));
                 } else {
                   restoredVars.push(null);
                 }
              } else {
                 restoredVars.push(v);
              }
           }
           s.generatedVariants = restoredVars.filter(Boolean);
        }
      }
    }

    if (project.posters) {
      for (const p of project.posters) await restoreAsset(p, 'imageUrl');
    }

    if (project.castList) {
      for (const c of project.castList) {
        await restoreAsset(c, 'characterImage');
        await restoreAsset(c, 'actorImage');
      }
    }
    
    if (project.videos) {
       for (const v of project.videos) await restoreAsset(v, 'url', true);
    }
    
    if (project.vaultItems) {
      for (const v of project.vaultItems) await restoreAsset(v, 'url');
    }

    return {
      project,
      slides,
      activeSlideId: meta.activeSlideId
    };
  }
}