/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Download, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Settings, 
  Camera, 
  Sun, 
  Eye, 
  Sliders, 
  Check,
  Undo2,
  FileText,
  History,
  AlertCircle,
  HelpCircle,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PromptStudioState, GeneratedImageRecord } from "./types";
import { AIImageEditor } from "./components/AIImageEditor";

// Constant Style Presets
const STYLES = [
  {
    key: 'Clean white studio',
    desc: 'clean white studio background, seamless white sweep, even soft studio lighting, commercial product photography aesthetic',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#f8f8f6"/><ellipse cx="100" cy="72" rx="52" ry="5" fill="#e8e4de"/><rect x="72" y="20" width="56" height="48" rx="3" fill="#ffffff" stroke="#e8e3da" stroke-width="1"/><rect x="78" y="26" width="44" height="32" rx="2" fill="#f4f2ee"/><circle cx="100" cy="42" r="10" fill="#e8e3da"/><rect x="84" y="60" width="32" height="5" rx="2" fill="#d6d0c7"/><rect x="18" y="14" width="2" height="50" rx="1" fill="#d6d0c7" opacity="0.6"/><rect x="180" y="14" width="2" height="50" rx="1" fill="#d6d0c7" opacity="0.6"/></svg>`
  },
  {
    key: 'Warm lifestyle flat lay',
    desc: 'warm lifestyle flat lay, light natural wood surface, soft ambient natural light, organic and warm toned',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#d4b896"/><line x1="0" y1="10" x2="200" y2="12" stroke="#c4a07a" stroke-width="1.5"/><line x1="0" y1="24" x2="200" y2="25" stroke="#c0986e" stroke-width="1.2"/><line x1="0" y1="40" x2="200" y2="41" stroke="#c4a07a" stroke-width="1.3"/><line x1="0" y1="56" x2="200" y2="56" stroke="#bc9468" stroke-width="1"/><line x1="0" y1="68" x2="200" y2="68" stroke="#c4a07a" stroke-width="1.1"/><rect x="58" y="14" width="84" height="54" rx="4" fill="#e8d0b0" opacity="0.8"/><circle cx="100" cy="36" r="13" fill="#c8956c"/><circle cx="100" cy="36" r="8" fill="#d4a87c"/><rect x="78" y="52" width="44" height="10" rx="3" fill="#b88050"/><ellipse cx="62" cy="60" rx="9" ry="6" fill="#6a8840" opacity="0.75"/><ellipse cx="140" cy="22" rx="7" ry="5" fill="#7a9848" opacity="0.65"/></svg>`
  },
  {
    key: 'Editorial dark moody',
    desc: 'editorial dark moody aesthetic, deep shadow areas, dramatic contrast, cinematic color grading, rich dark tones',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#111118"/><rect x="0" y="0" width="65" height="80" fill="#1a1428" opacity="0.8"/><rect x="135" y="0" width="65" height="80" fill="#080810" opacity="0.9"/><rect x="68" y="12" width="64" height="58" rx="3" fill="#221830"/><rect x="76" y="20" width="48" height="36" rx="2" fill="#180e22"/><ellipse cx="100" cy="38" rx="14" ry="18" fill="#2a1c38"/><rect x="88" y="56" width="24" height="8" rx="2" fill="#382850"/><rect x="66" y="8" width="3" height="64" rx="1.5" fill="#C9A84C" opacity="0.22"/><ellipse cx="68" cy="40" rx="18" ry="30" fill="rgba(201,168,76,0.04)"/></svg>`
  },
  {
    key: 'Bright airy Scandinavian',
    desc: 'bright airy Scandinavian aesthetic, white surfaces, minimal props, soft diffused natural window light, clean and calm',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#f2efe8"/><rect x="0" y="0" width="52" height="80" fill="#e8e4dc"/><rect x="50" y="0" width="1.5" height="80" fill="#d8d4cc"/><rect x="14" y="10" width="22" height="36" rx="2" fill="#d4d0c8"/><rect x="16" y="12" width="18" height="32" rx="1" fill="#ede9e0" opacity="0.8"/><rect x="60" y="18" width="108" height="54" rx="4" fill="#ffffff" opacity="0.9"/><circle cx="114" cy="42" r="15" fill="#e8e4dc"/><circle cx="114" cy="42" r="9" fill="#f4f0e8"/><rect x="74" y="62" width="76" height="6" rx="3" fill="#d4d0c8"/><ellipse cx="154" cy="28" rx="7" ry="13" fill="#8ab090" opacity="0.55"/></svg>`
  },
  {
    key: 'Kraft natural organic',
    desc: 'natural kraft and organic aesthetic, warm beige and brown tones, eco-friendly visual language, soft warm light',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#c8a870"/><rect x="52" y="12" width="96" height="58" rx="4" fill="#b89050"/><rect x="58" y="18" width="84" height="46" rx="3" fill="#d4aa68" opacity="0.65"/><rect x="66" y="26" width="68" height="30" rx="2" fill="#e8c880" opacity="0.45"/><line x1="52" y1="41" x2="148" y2="41" stroke="#a07840" stroke-width="0.8" opacity="0.4"/><line x1="100" y1="12" x2="100" y2="70" stroke="#a07840" stroke-width="0.8" opacity="0.4"/><circle cx="78" cy="34" r="8" fill="#804020" opacity="0.38"/><ellipse cx="124" cy="52" rx="10" ry="6" fill="#507028" opacity="0.45"/><circle cx="28" cy="40" r="14" fill="#b89050" opacity="0.4"/></svg>`
  },
  {
    key: 'Outdoor golden hour',
    desc: 'outdoor golden hour setting, warm directional sunlight, natural environment, soft bokeh background, golden warm tones',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="40" fill="#e8820c"/><rect y="36" width="200" height="44" fill="#3a5c10"/><rect y="32" width="200" height="12" fill="#5a8020" opacity="0.65"/><circle cx="26" cy="18" r="18" fill="#f5b030" opacity="0.9"/><circle cx="26" cy="18" r="12" fill="#f8c84c"/><ellipse cx="100" cy="50" rx="18" ry="24" fill="#4a7820" opacity="0.6"/><ellipse cx="148" cy="54" rx="14" ry="18" fill="#386010" opacity="0.55"/><rect x="82" y="24" width="36" height="46" rx="4" fill="#d8a030" opacity="0.8"/><rect x="88" y="30" width="24" height="30" rx="2" fill="#e8b848" opacity="0.7"/><circle cx="100" cy="45" r="8" fill="#c07828"/><line x1="64" y1="2" x2="78" y2="80" stroke="#f8d060" stroke-width="7" opacity="0.10"/></svg>`
  },
  {
    key: 'Neon urban night',
    desc: 'neon urban night setting, colorful neon reflections, dark background, vibrant and moody city atmosphere',
    svg: `<svg viewBox="0 0 200 80" class="w-full h-20" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="80" fill="#060810"/><rect x="16" y="6" width="30" height="50" rx="2" fill="#0e0e20"/><rect x="54" y="14" width="22" height="42" rx="2" fill="#080816"/><rect x="120" y="8" width="28" height="48" rx="2" fill="#0e0e20"/><rect x="155" y="18" width="24" height="38" rx="2" fill="#080816"/><rect x="18" y="10" width="7" height="10" rx="1" fill="#ff2080" opacity="0.8"/><rect x="30" y="16" width="6" height="8" rx="1" fill="#2080ff" opacity="0.75"/><rect x="56" y="20" width="8" height="7" rx="1" fill="#ff2080" opacity="0.6"/><rect x="122" y="14" width="10" height="7" rx="1" fill="#00e8b0" opacity="0.7"/><rect x="157" y="22" width="8" height="9" rx="1" fill="#a020ff" opacity="0.7"/><rect x="0" y="58" width="200" height="22" fill="#040610" opacity="0.9"/><ellipse cx="36" cy="66" rx="32" ry="6" fill="#ff2080" opacity="0.10"/><ellipse cx="100" cy="68" rx="42" ry="5" fill="#2060ff" opacity="0.09"/><rect x="72" y="26" width="56" height="34" rx="3" fill="#0e0818"/><ellipse cx="100" cy="43" rx="13" ry="8" fill="#160c28"/><rect x="84" y="54" width="32" height="5" rx="2" fill="#C9A84C" opacity="0.4"/></svg>`
  }
];

const INITIAL_STATE: PromptStudioState = {
  subject: { text: "", custom: [] },
  scene: { 
    angle: "", 
    distance: "", 
    environment: "", 
    custom: [], 
    refImages: [], 
    activeStyleIdx: -1, 
    stylePreset: "", 
    styleCustom: [],
    refImageOutput: null,
    refImageProduct: null
  },
  lighting: { type: "", direction: "", extras: [], custom: [] },
  camera: { body: "", lens: "", aperture: "", shutter: "", film: "", resolution: "", custom: [] },
  texture: { skin: [], eyes: [], fabric: [], environment: [], custom: [] },
  mood: { style: "", colorGrade: "", ratio: "", custom: [] },
  negative: { presets: [], custom: [] }
};

const QS_STYLES = [
  "Lifestyle warm & organic",
  "Editorial cosmetics & makeup photography",
  "Clean studio white background",
  "Crisp product presentation with dramatic shadow",
  "Nordic minimalist styling, light wood details",
  "Vibrant sunset lighting, rich shadows",
  "Moody cinematically back-lit scene",
  "E-commerce tabletop layout, high key lighting",
  "High contrast brutalist aesthetic",
  "Luxury jewelry macro closeup, bokeh flare"
];

const STEPS = [
  { id: "subject", label: "Subject", icon: Layers },
  { id: "scene", label: "Scene & Style", icon: ImageIcon },
  { id: "lighting", label: "Lighting", icon: Sun },
  { id: "camera", label: "Camera Specs", icon: Camera },
  { id: "texture", label: "Textures", icon: Eye },
  { id: "mood", label: "Mood & Ratio", icon: Sliders },
  { id: "negative", label: "Negatives", icon: Trash2 }
];

export default function App() {
  const [state, setState] = useState<PromptStudioState>(INITIAL_STATE);
  const [mode, setMode] = useState<"quick" | "builder">("quick");
  const [quickExtraContext, setQuickExtraContext] = useState("");
  const [quickSelectedStyles, setQuickSelectedStyles] = useState<string[]>([]);
  const [isAnalyzingPrompt, setIsAnalyzingPrompt] = useState(false);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [savedImageIds, setSavedImageIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("atlas_saved_image_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [editedPrompt, setEditedPrompt] = useState<string>("");
  const [isPromptEdited, setIsPromptEdited] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isEditingImg, setIsEditingImg] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedImageRecord[]>([]);
  const [loadingText, setLoadingText] = useState<string>("Analyzing layer matrices...");
  const [serverHasKey, setServerHasKey] = useState<boolean | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);

  // Custom additions inputs
  const [customSubject, setCustomSubject] = useState("");
  const [customScene, setCustomScene] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [customLight, setCustomLight] = useState("");
  const [customTexture, setCustomTexture] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [customNegative, setCustomNegative] = useState("");

  // Loading text cyclical timer
  useEffect(() => {
    if (!isGenerating) return;
    const progressMessages = [
      "Analyzing visual layers...",
      "Mapping prompt taxonomy...",
      "Sensing geometric highlights...",
      "Synthesizing texture matrices...",
      "Shaping lighting and shadow direction...",
      "Polishing surface grain structure...",
      "Invoking Imagen 3 high-fidelity pass..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % progressMessages.length;
      setLoadingText(progressMessages[idx]);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Read saved history & key status on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas_image_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }

    // Check if Express backend has the Gemini API Key
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setServerHasKey(!!data.hasApiKey))
      .catch((err) => {
        console.error("Failed to fetch server config status:", err);
        setServerHasKey(false);
      });
  }, []);

  // Sync edited prompt when options change, as long as the user hasn't typed their own prompt manually
  const liveCompiledPrompt = buildPrompt(state);
  
  useEffect(() => {
    if (!isPromptEdited) {
      setEditedPrompt(liveCompiledPrompt);
    }
  }, [liveCompiledPrompt, isPromptEdited]);

  // Construct prompt from state
  function buildPrompt(s: PromptStudioState) {
    const P: string[] = [];
    const subj = s.subject.text || (s.subject.custom && s.subject.custom[0]) || "";
    if (subj) P.push(subj + ".");

    const sc: string[] = [];
    if (s.scene.distance) sc.push(s.scene.distance);
    if (s.scene.environment) sc.push("on/against " + s.scene.environment.toLowerCase());
    if (s.scene.angle) sc.push(s.scene.angle + " camera angle");
    if (s.scene.custom && s.scene.custom.length) sc.push(...s.scene.custom);
    if (sc.length) P.push(sc.join(", ") + ".");

    const activeRef = s.scene.activeStyleIdx >= 0 && s.scene.refImages[s.scene.activeStyleIdx];
    if (activeRef) {
      P.push(`Scene style: replicate the exact scene composition, background, lighting direction, and surface from reference image (${activeRef.name}). Maintain identical environmental conditions across all product variations.`);
    }

    const sp = STYLES.find((style) => style.key === s.scene.stylePreset);
    if (sp) P.push("Image style: " + sp.desc + ".");
    if (s.scene.styleCustom && s.scene.styleCustom.length) {
      P.push("Additional style: " + s.scene.styleCustom.join(", ") + ".");
    }

    const li: string[] = [];
    if (s.lighting.type && s.lighting.direction) {
      li.push(s.lighting.direction + " " + s.lighting.type.toLowerCase());
    } else if (s.lighting.type) {
      li.push(s.lighting.type);
    } else if (s.lighting.direction) {
      li.push(s.lighting.direction + " lighting");
    }
    if (s.lighting.extras && s.lighting.extras.length) {
      li.push(...s.lighting.extras.map((e) => e.toLowerCase()));
    }
    if (s.lighting.custom && s.lighting.custom.length) {
      li.push(...s.lighting.custom);
    }
    if (li.length) P.push("Lighting: " + li.join(", ") + ".");

    const ca: string[] = [];
    if (s.camera.body) ca.push("Shot on a " + s.camera.body);
    if (s.camera.lens) ca.push(s.camera.lens);
    if (s.camera.aperture) ca.push(s.camera.aperture + " aperture");
    if (s.camera.shutter) ca.push(s.camera.shutter + " shutter speed");
    if (s.camera.film) ca.push(s.camera.film);
    if (s.camera.resolution) ca.push(s.camera.resolution);
    if (ca.length) P.push(ca.join(", ") + ".");

    const tx: string[] = [];
    (["skin", "eyes", "fabric", "environment", "custom"] as const).forEach((key) => {
      if (s.texture[key] && s.texture[key].length) {
        tx.push(...s.texture[key]);
      }
    });
    if (tx.length) P.push("Texture: " + tx.join(", ") + ".");

    const mo: string[] = [];
    if (s.mood.style) mo.push(s.mood.style);
    if (s.mood.colorGrade) mo.push(s.mood.colorGrade);
    if (s.mood.ratio) mo.push("Aspect ratio: " + s.mood.ratio);
    if (s.mood.custom && s.mood.custom.length) mo.push(...s.mood.custom);
    if (mo.length) P.push("Style: " + mo.join(". ") + ".");

    const neg = [...(s.negative.presets || []), ...(s.negative.custom || [])];
    if (neg.length) {
      // Group neg rules elegantly in Imagen-ready negative prefixes
      P.push("\n" + neg.join(", "));
    }

    return P.join("\n");
  }

  // Check if a section has selected values to highlight dots
  function hasDataInStep(stepId: string): boolean {
    const s = state[stepId as keyof PromptStudioState];
    if (!s) return false;
    return Object.values(s).some((val) => {
      if (Array.isArray(val)) return val.length > 0;
      return val !== "" && val !== -1;
    });
  }

  // Toggle single chips
  function toggleChip(stepId: keyof PromptStudioState, propKey: string, value: string) {
    setIsPromptEdited(false);
    setState((prev) => {
      const stepData = { ...prev[stepId] } as any;
      if (stepData[propKey] === value) {
        stepData[propKey] = "";
      } else {
        stepData[propKey] = value;
      }
      return { ...prev, [stepId]: stepData };
    });
  }

  // Toggle multi-select chips
  function toggleMultiChip(stepId: keyof PromptStudioState, propKey: string, value: string) {
    setIsPromptEdited(false);
    setState((prev) => {
      const stepData = { ...prev[stepId] } as any;
      const arr = Array.isArray(stepData[propKey]) ? [...stepData[propKey]] : [];
      const idx = arr.indexOf(value);
      if (idx > -1) {
        arr.splice(idx, 1);
      } else {
        arr.push(value);
      }
      stepData[propKey] = arr;
      return { ...prev, [stepId]: stepData };
    });
  }

  // Add custom typed tags
  function addCustomTag(stepId: keyof PromptStudioState, propKey: string, tag: string, setter: (v: string) => void) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setIsPromptEdited(false);
    setState((prev) => {
      const stepData = { ...prev[stepId] } as any;
      const arr = Array.isArray(stepData[propKey]) ? [...stepData[propKey]] : [];
      if (!arr.includes(trimmed)) {
        arr.push(trimmed);
      }
      stepData[propKey] = arr;
      return { ...prev, [stepId]: stepData };
    });
    setter("");
  }

  // Remove custom typed tags
  function removeCustomTag(stepId: keyof PromptStudioState, propKey: string, tag: string) {
    setIsPromptEdited(false);
    setState((prev) => {
      const stepData = { ...prev[stepId] } as any;
      const arr = Array.isArray(stepData[propKey]) ? [...stepData[propKey]] : [];
      const filtered = arr.filter((t) => t !== tag);
      stepData[propKey] = filtered;
      return { ...prev, [stepId]: stepData };
    });
  }

  // Trigger base64 file reading for reference styles
  function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const loadedSrc = event.target.result as string;
          setState((prev) => {
            const nextRefImages = [...prev.scene.refImages, { name: file.name, src: loadedSrc }];
            const nextActiveIdx = prev.scene.activeStyleIdx === -1 ? 0 : prev.scene.activeStyleIdx;
            return {
              ...prev,
              scene: {
                ...prev.scene,
                refImages: nextRefImages,
                activeStyleIdx: nextActiveIdx
              }
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  // Reset entire studio to initial empty state
  function handleResetAll() {
    setState(INITIAL_STATE);
    setCurrentStepIdx(0);
    setEditedPrompt("");
    setIsPromptEdited(false);
    setGenerationError(null);
  }

  // Call API for prompt to image generation
  async function handleGenerate() {
    if (!editedPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    // Grab Aspect Ratio mapping
    const rawRatio = state.mood.ratio || "1:1";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: editedPrompt,
          ratio: rawRatio
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during generation via the server.");
      }

      if (data.imageUrl) {
        setGeneratedImg(data.imageUrl);

        // Store generated image record in history list
        const record: GeneratedImageRecord = {
          id: String(Date.now()),
          url: data.imageUrl,
          prompt: editedPrompt,
          timestamp: Date.now(),
          ratio: rawRatio
        };

        const updatedHistory = [record, ...history.slice(0, 19)]; // limit to 20
        setHistory(updatedHistory);
        localStorage.setItem("atlas_image_history", JSON.stringify(updatedHistory));
      } else {
        throw new Error("No image data returned from generator backend.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Failed to contact Imagen server.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Copy structured prompt string to clipboard
  function handleCopyPrompt() {
    if (!editedPrompt) return;
    navigator.clipboard.writeText(editedPrompt).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 1500);
    });
  }

  // Save prompt text file
  function handleSaveText() {
    if (!editedPrompt) return;
    const blob = new Blob([editedPrompt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `atlas-photoreal-prompt-${Date.now()}.txt`;
    a.click();
  }

  // Load selection details back from a history record
  function handleSelectHistoryItem(record: GeneratedImageRecord) {
    setGeneratedImg(record.url);
    setEditedPrompt(record.prompt);
    setIsPromptEdited(true); // Treat as manually changed since it represents past compiled state
  }

  // Clear a single item from historical carousel
  function handleClearHistoryItem(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const filtered = history.filter((h) => h.id !== id);
    setHistory(filtered);
    localStorage.setItem("atlas_image_history", JSON.stringify(filtered));
  }

  // Toggle saving bookmark of an image
  function handleToggleSaveImage(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    let nextSaved = [...savedImageIds];
    if (nextSaved.includes(id)) {
      nextSaved = nextSaved.filter((item) => item !== id);
    } else {
      nextSaved.push(id);
    }
    setSavedImageIds(nextSaved);
    localStorage.setItem("atlas_saved_image_ids", JSON.stringify(nextSaved));
  }

  // Generate dynamic variation using combined Gemini and Imagen backend API
  async function handleGenerateVariation(e: React.MouseEvent, record: GeneratedImageRecord) {
    e.stopPropagation();
    if (isGenerating || isGeneratingVariation) return;
    setIsGenerating(true);
    setIsGeneratingVariation(true);
    setGenerationError(null);
    setLoadingText("Formulating visual variation prompt with Gemini...");

    try {
      const response = await fetch("/api/generate-variation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: record.prompt,
          ratio: record.ratio || state.mood.ratio || "1:1",
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate visual variation.");
      }

      const data = await response.json();
      setGeneratedImg(data.imageUrl);
      setEditedPrompt(data.variedPrompt);
      setIsPromptEdited(true);

      const newRecord: GeneratedImageRecord = {
        id: String(Date.now()),
        url: data.imageUrl,
        prompt: data.variedPrompt,
        timestamp: Date.now(),
        ratio: record.ratio || "1:1",
      };

      const nextHistory = [newRecord, ...history];
      setHistory(nextHistory);
      localStorage.setItem("atlas_image_history", JSON.stringify(nextHistory));
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "An error occurred while synthesizing your variation.");
    } finally {
      setIsGenerating(false);
      setIsGeneratingVariation(false);
    }
  }

  // Refine draft/builder prompt using historical referenced images on backend
  async function handleRefinePromptWithAI() {
    if (!editedPrompt.trim()) return;
    setIsAnalyzingPrompt(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/refine-builder-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftPrompt: editedPrompt,
          refImageOutput: state.scene.refImageOutput,
          refImageProduct: state.scene.refImageProduct,
          refImageExtras: state.scene.refImages,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to refine draft prompt.");
      }

      const data = await response.json();
      setEditedPrompt(data.prompt);
      setIsPromptEdited(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during prompt refinement.");
    } finally {
      setIsAnalyzingPrompt(false);
    }
  }

  // Create prompt using Slot visual matrices from Gemini backend
  async function handleQuickGeneratePrompt() {
    setIsAnalyzingPrompt(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/quick-generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refImageOutput: state.scene.refImageOutput,
          refImageProduct: state.scene.refImageProduct,
          refImageExtras: state.scene.refImages,
          extraContext: quickExtraContext,
          selectedStyles: quickSelectedStyles,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze reference images.");
      }

      const data = await response.json();
      setEditedPrompt(data.prompt);
      setIsPromptEdited(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while generating your prompt with Gemini.");
    } finally {
      setIsAnalyzingPrompt(false);
    }
  }

  // File Slots handling (A and B)
  function handleOutputUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const loadedSrc = event.target.result as string;
        setState((prev) => ({
          ...prev,
          scene: {
            ...prev.scene,
            refImageOutput: { name: file.name, src: loadedSrc }
          }
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleProductUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const loadedSrc = event.target.result as string;
        setState((prev) => ({
          ...prev,
          scene: {
            ...prev.scene,
            refImageProduct: { name: file.name, src: loadedSrc }
          }
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Returns tailwind styling tags corresponding to the active choice
  function getChipClass(isSelected: boolean, colorClass: "navy" | "gold" | "slate" | "sand" | "brown"): string {
    if (!isSelected) {
      return "bg-atlas-surface border border-atlas-border2 text-atlas-slate hover:border-atlas-navy hover:text-atlas-navy cursor-pointer transition-all duration-120 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap leading-relaxed";
    }
    switch (colorClass) {
      case "navy":
        return "bg-atlas-navy border border-atlas-navy text-white font-medium cursor-pointer transition-all duration-120 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap leading-relaxed shadow-sm";
      case "gold":
        return "bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#8a6a1a] font-medium cursor-pointer transition-all duration-120 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap leading-relaxed shadow-sm";
      case "slate":
        return "bg-[#434D59]/10 border border-[#434D59]/30 text-atlas-slate font-medium cursor-pointer transition-all duration-120 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap leading-relaxed shadow-sm";
      case "sand":
        return "bg-[#E1D9CC]/40 border border-[#D6D0C7] text-atlas-slate font-medium cursor-pointer transition-all duration-120 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap leading-relaxed shadow-sm";
      case "brown":
        return "bg-[#9E8A78]/15 border border-[#9E8A78]/40 text-[#6a5040] font-medium cursor-pointer transition-all duration-120 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap leading-relaxed shadow-sm";
    }
  }

  // Map user aspect ratios to descriptive height frames of container preview boxes
  const currentRatioClass = () => {
    const r = state.mood.ratio || "";
    if (r.includes("16:9")) return "aspect-video max-h-[380px]";
    if (r.includes("9:16")) return "aspect-[9/16] max-h-[500px]";
    if (r.includes("4:5")) return "aspect-[4/5] max-h-[440px]";
    return "aspect-square max-h-[400px]"; // standard 1:1
  };

  return (
    <div className="min-h-screen bg-atlas-bg text-atlas-navy flex flex-col selection:bg-atlas-gold/20 selection:text-atlas-navy">
      {/* Upper header */}
      <header className="border-b border-atlas-border bg-atlas-surface/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-atlas-navy text-atlas-bg p-2 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-atlas-gold" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif-accent font-semibold tracking-tight text-atlas-navy flex items-center gap-2">
                ATLAS <span className="font-sans text-[11px] font-semibold tracking-widest text-[#9E8A78] uppercase border-l border-atlas-border px-2">Prompt Studio</span>
              </h1>
              <p className="text-[11px] md:text-sm text-atlas-slate hidden md:block">
                High-fidelity photorealistic layer synthesizer & standalone Imagen 3 image generator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {serverHasKey === false && (
              <button 
                onClick={() => setShowConfigHelp(true)}
                className="bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5 border border-red-200 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>API Key Setup</span>
              </button>
            )}
            <button
              onClick={handleResetAll}
              className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate text-[11px] md:text-xs font-medium px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Studio</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Modular Synthesizer Steps (7 columns on desktop) */}
        <section className="col-span-1 lg:col-span-7 flex flex-col gap-5">
          
          {/* Studio Mode Selector Panel */}
          <div className="bg-atlas-surface border border-atlas-border rounded-xl p-1.5 shadow-sm flex gap-2">
            <button
              onClick={() => {
                setMode("quick");
                setGenerationError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === "quick"
                  ? "bg-atlas-navy text-white shadow-sm"
                  : "bg-transparent text-atlas-slate hover:bg-atlas-surface2/50"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${mode === "quick" ? "text-atlas-gold animate-pulse" : "text-atlas-grey"}`} />
              <span>Quick Studio</span>
            </button>
            <button
              onClick={() => {
                setMode("builder");
                setGenerationError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === "builder"
                  ? "bg-atlas-navy text-white shadow-sm"
                  : "bg-transparent text-atlas-slate hover:bg-atlas-surface2/50"
              }`}
            >
              <Sliders className={`w-4 h-4 ${mode === "builder" ? "text-atlas-gold" : "text-atlas-grey"}`} />
              <span>Prompt Builder</span>
            </button>
          </div>

          {mode === "quick" ? (
            <div className="flex flex-col gap-5" id="quick-panel">
              
              {/* Step 1: Reference Upload Slots */}
              <div className="bg-atlas-surface border border-atlas-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-atlas-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-atlas-gold animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#293140] font-sans">STEP 1: Upload Reference Materials</h3>
                  </div>
                  <span className="text-[10px] text-[#9E8A78] font-mono">Gemini Vision Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Slot A: Desired Framing / Scene Output */}
                  <div className="border border-dashed border-atlas-border2 rounded-xl p-4 flex flex-col items-center justify-center text-center relative bg-atlas-bg/25 hover:bg-atlas-bg/50 transition-all min-h-[160px]">
                    {state.scene.refImageOutput ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img referrerPolicy="no-referrer" src={state.scene.refImageOutput.src} className="w-full h-24 object-cover rounded mb-2 border" />
                        <span className="text-[10px] text-atlas-slate font-medium truncate max-w-full block px-1">{state.scene.refImageOutput.name}</span>
                        <button
                          onClick={() => setState(prev => ({ ...prev, scene: { ...prev.scene, refImageOutput: null } }))}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                        <input type="file" accept="image/*" onChange={handleOutputUpload} className="hidden" />
                        <span className="text-xl text-[#9E8A78] mb-1">🖼️</span>
                        <span className="text-xs font-semibold text-atlas-slate">Desired Framing</span>
                        <span className="text-[9px] text-atlas-grey mt-0.5 leading-tight">Image layout or perspective style</span>
                      </label>
                    )}
                    <div className="absolute top-2 left-2 bg-atlas-navy/80 text-white text-[8px] px-1.5 py-0.5 rounded font-mono uppercase">
                      Slot A
                    </div>
                  </div>

                  {/* Slot B: Main Product Image */}
                  <div className="border border-dashed border-atlas-border2 rounded-xl p-4 flex flex-col items-center justify-center text-center relative bg-atlas-bg/25 hover:bg-atlas-bg/50 transition-all min-h-[160px]">
                    {state.scene.refImageProduct ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img referrerPolicy="no-referrer" src={state.scene.refImageProduct.src} className="w-full h-24 object-cover rounded mb-2 border" />
                        <span className="text-[10px] text-atlas-slate font-medium truncate max-w-full block px-1">{state.scene.refImageProduct.name}</span>
                        <button
                          onClick={() => setState(prev => ({ ...prev, scene: { ...prev.scene, refImageProduct: null } }))}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                        <input type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />
                        <span className="text-xl text-[#9E8A78] mb-1">🧴</span>
                        <span className="text-xs font-semibold text-atlas-slate">Product Image</span>
                        <span className="text-[9px] text-atlas-grey mt-0.5 leading-tight">The product model to feature</span>
                      </label>
                    )}
                    <div className="absolute top-2 left-2 bg-atlas-navy/80 text-white text-[8px] px-1.5 py-0.5 rounded font-mono uppercase">
                      Slot B
                    </div>
                  </div>

                  {/* Slot C: Additional Visual References */}
                  <div className="border border-dashed border-atlas-border2 rounded-xl p-4 flex flex-col items-center justify-center text-center relative bg-atlas-bg/25 hover:bg-atlas-bg/50 transition-all min-h-[160px]">
                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                      <input type="file" accept="image/*" multiple onChange={handleReferenceUpload} className="hidden" />
                      <span className="text-xl text-[#9E8A78] mb-1">➕</span>
                      <span className="text-xs font-semibold text-atlas-slate">Additional Refs</span>
                      <span className="text-[9px] text-atlas-grey mt-0.5 leading-tight">Upload raw style maps ({state.scene.refImages.length} loaded)</span>
                    </label>
                    <div className="absolute top-2 left-2 bg-atlas-navy/80 text-white text-[8px] px-1.5 py-0.5 rounded font-mono uppercase">
                      Slot C
                    </div>
                  </div>
                </div>

                {/* Display additional uploaded references thumbnails */}
                {state.scene.refImages.length > 0 && (
                  <div className="bg-atlas-bg/40 rounded-lg p-3 border border-atlas-border2">
                    <span className="text-[10px] uppercase tracking-widest text-[#9E8A78] font-bold mb-2 block">Slot C (Additional References) List</span>
                    <div className="flex flex-wrap gap-2">
                      {state.scene.refImages.map((img, i) => (
                        <div key={i} className="relative w-12 h-12 rounded border bg-white overflow-hidden group">
                          <img referrerPolicy="no-referrer" src={img.src} className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              setState(prev => {
                                const filtered = prev.scene.refImages.filter((_, idx) => idx !== i);
                                return { ...prev, scene: { ...prev.scene, refImages: filtered } };
                              });
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white hover:bg-red-600 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold shadow"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Options and Prompt Compiler Card */}
              <div className="bg-atlas-surface border border-atlas-border rounded-xl p-6 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-atlas-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-atlas-gold animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#293140] font-sans">STEP 2: Define Scene Details</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-atlas-slate uppercase tracking-wider block">Additional context (optional)</label>
                  <textarea
                    value={quickExtraContext}
                    onChange={(e) => setQuickExtraContext(e.target.value)}
                    placeholder="Add any extra context Gemini should know — e.g. 'The background is a sun-drenched Nordic wood tabletop with white linen.' Leave blank to let Gemini describe from images directly."
                    className="w-full min-h-[90px] p-3 text-xs font-mono bg-atlas-surface2/30 border border-atlas-border2 rounded-lg text-atlas-navy outline-none focus:border-atlas-navy focus:bg-atlas-surface resize-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-atlas-slate uppercase tracking-wider block">Photography Style Preset (optional)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                    {QS_STYLES.map((styleStr) => {
                      const isSelected = quickSelectedStyles.includes(styleStr);
                      return (
                        <button
                          key={styleStr}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setQuickSelectedStyles(prev => prev.filter(s => s !== styleStr));
                            } else {
                              setQuickSelectedStyles(prev => [...prev, styleStr]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-120 border ${
                            isSelected 
                              ? "bg-atlas-navy text-white border-atlas-navy shadow-sm"
                              : "bg-atlas-bg text-atlas-slate border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy cursor-pointer"
                          }`}
                        >
                          {styleStr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  disabled={isAnalyzingPrompt || (!state.scene.refImageOutput && !state.scene.refImageProduct && state.scene.refImages.length === 0)}
                  onClick={handleQuickGeneratePrompt}
                  className={`w-full py-3.5 px-4 rounded-lg text-xs font-semibold text-white tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isAnalyzingPrompt
                      ? "bg-atlas-grey cursor-not-allowed"
                      : (!state.scene.refImageOutput && !state.scene.refImageProduct && state.scene.refImages.length === 0)
                      ? "bg-atlas-surface border border-atlas-border text-atlas-grey cursor-not-allowed hover:bg-atlas-bg"
                      : "bg-[#C9A84C] hover:bg-[#bfa043] border border-transparent hover:border-[#1e2535]"
                  }`}
                >
                  {isAnalyzingPrompt ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                      <span>Gemini is analyzing visual matrices...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>✦ Generate Prompt from references</span>
                    </>
                  )}
                </button>
                {(!state.scene.refImageOutput && !state.scene.refImageProduct && state.scene.refImages.length === 0) && (
                  <span className="text-[10px] text-center text-atlas-grey -mt-2 block">Upload at least one reference picture above to activate Gemini prompt generation.</span>
                )}
              </div>

            </div>
          ) : (
            <>
              {/* Step Progress Navigation Toggles */}
              <nav className="bg-atlas-surface border border-atlas-border rounded-xl p-1 flex flex-wrap gap-1 shadow-sm md:flex-nowrap overflow-x-auto z-10">
                {STEPS.map((step, idx) => {
                  const IconComp = step.icon;
                  const isActive = currentStepIdx === idx;
                  const isFilled = hasDataInStep(step.id);
                  return (
                    <button
                      key={step.id}
                      id={`step-nav-${step.id}`}
                      onClick={() => {
                        setCurrentStepIdx(idx);
                        setGenerationError(null);
                      }}
                      className={`flex-1 min-w-[76px] py-2 px-1.5 rounded-lg flex flex-col md:flex-row items-center justify-center gap-1 cursor-pointer transition-all duration-150 relative ${
                        isActive 
                          ? "bg-atlas-navy text-white shadow-sm" 
                          : isFilled
                          ? "bg-atlas-surface2/60 text-atlas-navy hover:bg-atlas-surface2"
                          : "text-atlas-grey hover:bg-atlas-surface2/40 hover:text-atlas-slate"
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-atlas-gold" : isFilled ? "text-[#9E8A78]" : "text-current"}`} />
                      <span className="text-[10px] md:text-[11px] font-medium tracking-wide whitespace-nowrap">{step.label}</span>
                      {isFilled && !isActive && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-atlas-gold rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Active Synthesis Controls card */}
              <div className="bg-atlas-surface border border-atlas-border rounded-xl p-6 md:p-8 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="min-h-[320px] flex flex-col"
                  >
                {/* 1. SUBJECT STEP */}
                {currentStepIdx === 0 && (
                  <div className="flex flex-col gap-6" id="step-panel-subject">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-atlas-navy">Subject Definition</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 1</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Choose the primary focal figure or product for your generation.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-3">Preselected Prototypes</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Young girl, 4-5 years old",
                          "Young boy, 5-7 years old",
                          "Child hands only (no face)",
                          "Product only, no person",
                          "Woman, late 20s, editorial",
                          "Man, 40s, weathered"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleChip("subject", "text", item)}
                            className={getChipClass(state.subject.text === item, "navy")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mt-2">Describe Your Own Custom Subject</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("subject", "custom", customSubject, setCustomSubject)}
                          placeholder="e.g. A delicate glass lotion pump bottle, translucent liquid..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("subject", "custom", customSubject, setCustomSubject)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                      
                      {state.subject.custom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.subject.custom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full text-xs text-[#8a6a1a]">
                              <span>{tag}</span>
                              <button onClick={() => removeCustomTag("subject", "custom", tag)} className="text-[#8a6a1a]/60 hover:text-red-600 transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. SCENE & STYLE STEP */}
                {currentStepIdx === 1 && (
                  <div className="flex flex-col gap-6" id="step-panel-scene">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-atlas-navy">Scene & Angle Style</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 2</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Configure framing coordinates, camera position, environmental backgrounds, or reference templates.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Camera Angle</h3>
                        <div className="flex flex-col items-start gap-1.5 w-full">
                          {[
                            "Eye-level",
                            "Strict top-down overhead",
                            "Slightly elevated (75 degrees)",
                            "Low angle (looking up)",
                            "Dutch angle (tension)",
                            "Bird's eye view"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("scene", "angle", item)}
                              className={`w-full text-left truncate ${getChipClass(state.scene.angle === item, "slate")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Shot Distance</h3>
                        <div className="flex flex-col items-start gap-1.5 w-full">
                          {[
                            "Close-up portrait",
                            "Medium shot (waist up)",
                            "Wide environmental",
                            "Flat lay (product)",
                            "Macro detail",
                            "Full body"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("scene", "distance", item)}
                              className={`w-full text-left truncate ${getChipClass(state.scene.distance === item, "slate")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Background / Environment</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Light baltic birch wood table",
                          "Warm cream surface (#F5F0EA)",
                          "White shiplap wall",
                          "Soft neutral interior",
                          "Outdoor natural setting",
                          "Plain studio seamless",
                          "Warm wood paneling, blurred"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleChip("scene", "environment", item)}
                            className={getChipClass(state.scene.environment === item, "slate")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">Custom Environment details</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customScene}
                          onChange={(e) => setCustomScene(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("scene", "custom", customScene, setCustomScene)}
                          placeholder="e.g. against a concrete brutalist interior with natural soft light..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("scene", "custom", customScene, setCustomScene)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                      {state.scene.custom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.scene.custom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-[#434D59]/10 border border-[#434D59]/30 rounded-full text-xs text-atlas-slate">
                              <span>{tag}</span>
                              <button onClick={() => removeCustomTag("scene", "custom", tag)} className="text-atlas-slate/60 hover:text-red-600 transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-atlas-border" />

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-3">Upload Style / Image Reference</h3>
                      <div className="border-2 border-dashed border-atlas-border2 rounded-xl p-6 text-center bg-atlas-bg/30 hover:bg-atlas-bg/60 hover:border-atlas-navy transition-all duration-150 cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleReferenceUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="pointer-events-none flex flex-col items-center">
                          <span className="text-2xl text-atlas-grey mb-1">↑</span>
                          <span className="text-xs font-semibold text-atlas-slate">Click to Upload Reference Images</span>
                          <span className="text-[10px] text-atlas-grey mt-0.5">JPG, PNG, WEBP allowed. System automatically maps styling matrices.</span>
                        </div>
                      </div>

                      {state.scene.refImages.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-[10px] font-bold text-atlas-slate uppercase mb-2">Stored Reference Images</h4>
                          <div className="flex flex-wrap gap-3">
                            {state.scene.refImages.map((img, i) => {
                              const isActive = state.scene.activeStyleIdx === i;
                              return (
                                <div
                                  key={i}
                                  onClick={() => setState(prev => ({ ...prev, scene: { ...prev.scene, activeStyleIdx: i } }))}
                                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                    isActive ? "border-atlas-navy scale-[1.03] shadow-md" : "border-atlas-border2 opacity-70 hover:opacity-100"
                                  }`}
                                >
                                  <img referrerPolicy="no-referrer" src={img.src} alt={img.name} className="w-full h-full object-cover" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setState((prev) => {
                                        const nextRef = prev.scene.refImages.filter((_, idx) => idx !== i);
                                        const nextIdx = nextRef.length > 0 ? 0 : -1;
                                        return {
                                          ...prev,
                                          scene: { ...prev.scene, refImages: nextRef, activeStyleIdx: nextIdx }
                                        };
                                      });
                                    }}
                                    className="absolute top-1 right-1 bg-white/95 text-atlas-navy hover:text-white hover:bg-red-500 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] shadow duration-100 font-bold border border-atlas-border"
                                  >
                                    &times;
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-atlas-navy/80 text-white text-[8px] py-0.5 text-center truncate px-1">
                                    {isActive ? "Active Matrix" : "Set Active"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <hr className="border-atlas-border" />

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-3">Preselected Classic Image Styles</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {STYLES.map((style) => {
                          const isSel = state.scene.stylePreset === style.key;
                          return (
                            <div
                              key={style.key}
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  scene: { ...prev.scene, stylePreset: prev.scene.stylePreset === style.key ? "" : style.key }
                                }));
                              }}
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all bg-atlas-bg/30 text-left flex flex-col hover:border-atlas-navy ${
                                isSel ? "border-2 border-atlas-navy scale-[1.01] shadow-sm" : "border-atlas-border opacity-80 hover:opacity-100"
                              }`}
                            >
                              <div dangerouslySetInnerHTML={{ __html: style.svg }} />
                              <div className="p-2 flex items-center justify-between gap-1 border-t border-atlas-border bg-white mt-auto">
                                <span className={`text-[10px] block leading-tight ${isSel ? "text-atlas-navy font-semibold" : "text-atlas-slate"}`}>
                                  {style.key}
                                </span>
                                {isSel && <div className="w-4 h-4 rounded-full bg-atlas-navy flex items-center justify-center text-white text-[8px]">✓</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">Describe Your Own Image Style</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customStyle}
                          onChange={(e) => setCustomStyle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("scene", "styleCustom", customStyle, setCustomStyle)}
                          placeholder="e.g. analog expired film aesthetic, soft lens dispersion..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("scene", "styleCustom", customStyle, setCustomStyle)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add Style
                        </button>
                      </div>
                      {state.scene.styleCustom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.scene.styleCustom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-atlas-navy text-white rounded-full text-xs">
                              <span>{tag}</span>
                              <button onClick={() => removeCustomTag("scene", "styleCustom", tag)} className="text-white/70 hover:text-[#C9A84C] transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. LIGHTING STEP */}
                {currentStepIdx === 2 && (
                  <div className="flex flex-col gap-6" id="step-panel-lighting">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-atlas-navy">Lighting Directions</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 3</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Determine source direction, softbox focus, and secondary fill modifiers.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Lighting Type</h3>
                        <div className="flex flex-col items-start gap-1.5 w-full">
                          {[
                            "Golden hour sunlight",
                            "Soft natural window light",
                            "Overcast diffused light",
                            "Studio softbox",
                            "Rembrandt lighting",
                            "Candlelight",
                            "Neon backlight",
                            "Harsh midday sun"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("lighting", "type", item)}
                              className={`w-full text-left truncate ${getChipClass(state.lighting.type === item, "gold")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Direction</h3>
                        <div className="flex flex-col items-start gap-1.5 w-full">
                          {[
                            "From the left",
                            "From the right",
                            "Front-lit",
                            "Back-lit",
                            "Side-lit",
                            "Top-down overhead",
                            "45 degrees above left"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("lighting", "direction", item)}
                              className={`w-full text-left truncate ${getChipClass(state.lighting.direction === item, "gold")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Lighting Enhancements (Multi-Select)</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Subtle rim light on hair",
                          "Warm highlight on cheekbone",
                          "Ambient occlusion in eye sockets",
                          "Diffused fill from opposite side",
                          "Natural shadow under chin",
                          "Soft drop shadow beneath product"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("lighting", "extras", item)}
                            className={getChipClass(state.lighting.extras.includes(item), "gold")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">Custom Lighting Directives</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customLight}
                          onChange={(e) => setCustomLight(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("lighting", "custom", customLight, setCustomLight)}
                          placeholder="e.g. dynamic chiaroscuro contrast, golden rays through slatted blinds..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("lighting", "custom", customLight, setCustomLight)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                      {state.lighting.custom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.lighting.custom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full text-xs text-[#8a6a1a]">
                              <span>{tag}</span>
                              <button onClick={() => removeCustomTag("lighting", "custom", tag)} className="text-[#8a6a1a]/60 hover:text-red-600 transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. CAMERA SPECS STEP */}
                {currentStepIdx === 3 && (
                  <div className="flex flex-col gap-6" id="step-panel-camera">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-atlas-navy">Camera Specifications</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 4</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Control hardware parameters like lenses, apertures, shutter ratios, and film stock simulations.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Camera Body</h3>
                        <div className="flex flex-col items-start gap-1.5 w-full">
                          {[
                            "Sony A7R V",
                            "Canon 5D Mark IV",
                            "Nikon Z9",
                            "Hasselblad 907X",
                            "Canon R5",
                            "Fujifilm GFX 100S"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("camera", "body", item)}
                              className={`w-full text-left truncate ${getChipClass(state.camera.body === item, "sand")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Optics / Lens</h3>
                        <div className="flex flex-col items-start gap-1.5 w-full">
                          {[
                            "85mm prime (portrait)",
                            "35mm wide (environmental)",
                            "50mm standard",
                            "200mm telephoto",
                            "24mm wide (landscape)",
                            "100mm macro"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("camera", "lens", item)}
                              className={`w-full text-left truncate ${getChipClass(state.camera.lens === item, "sand")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-2">
                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Aperture</h3>
                        <div className="flex flex-col items-start gap-1 w-full max-h-[140px] overflow-y-auto">
                          {["f/1.4", "f/1.8", "f/2.2", "f/2.8", "f/5.6", "f/8", "f/11"].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("camera", "aperture", item)}
                              className={`w-full text-left truncate py-1 text-[11px] ${getChipClass(state.camera.aperture === item, "sand")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Shutter speed</h3>
                        <div className="flex flex-col items-start gap-1 w-full max-h-[140px] overflow-y-auto">
                          {["1/60s", "1/250s", "1/400s", "1/500s", "1/1000s"].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("camera", "shutter", item)}
                              className={`w-full text-left truncate py-1 text-[11px] ${getChipClass(state.camera.shutter === item, "sand")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2">Film Stock/ISO</h3>
                        <div className="flex flex-col items-start gap-1 w-full max-h-[140px] overflow-y-auto">
                          {["ISO 100", "ISO 200", "ISO 400", "ISO 800", "Kodak Portra 400", "Fujifilm Velvia", "Ilford HP5"].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleChip("camera", "film", item)}
                              className={`w-full text-left truncate py-1 text-[11px] ${getChipClass(state.camera.film === item, "sand")}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Target Image Resolution</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "8K",
                          "Ultra-high resolution",
                          "DSLR quality",
                          "Medium format quality"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleChip("camera", "resolution", item)}
                            className={getChipClass(state.camera.resolution === item, "sand")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. TEXTURES STEP */}
                {currentStepIdx === 4 && (
                  <div className="flex flex-col gap-6" id="step-panel-textures">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-[#293140]">Detail & Texture Synthesizer</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 5</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Refined microscopic vectors: human pore densities, textile friction lines, and organic moisture drops.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Human Skin Structure</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Visible pores",
                            "Natural skin texture",
                            "Subtle blemishes",
                            "Epidermal texture",
                            "Rosy cheeks",
                            "Subsurface scattering",
                            "Fine facial hair",
                            "Slight skin irregularities"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleMultiChip("texture", "skin", item)}
                              className={getChipClass(state.texture.skin.includes(item), "brown")}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Human Eye Optics</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Sharp catchlights in both eyes",
                            "Realistic iris veining",
                            "Natural eye moisture",
                            "Subtle redness at corners",
                            "Crow's feet at outer corners",
                            "Natural wet look on lower lash line"
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => toggleMultiChip("texture", "eyes", item)}
                              className={getChipClass(state.texture.eyes.includes(item), "brown")}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Textile & Material Finish</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Rough linen weave",
                          "Worn denim with friction marks",
                          "Silk sheen at seam",
                          "Cozy knit texture",
                          "Kraft cardboard texture",
                          "Silicone matte surface",
                          "Natural wood grain"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("texture", "fabric", item)}
                            className={getChipClass(state.texture.fabric.includes(item), "brown")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Environmental micro-textures</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Pale blonde wood grain",
                          "Matte cream surface",
                          "Slight marker smudge on surface",
                          "Micro-droplets on surface",
                          "Natural scatter of objects"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("texture", "environment", item)}
                            className={getChipClass(state.texture.environment.includes(item), "brown")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">Custom Texture Details</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTexture}
                          onChange={(e) => setCustomTexture(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("texture", "custom", customTexture, setCustomTexture)}
                          placeholder="e.g. microscopic metal dust, fingerprint oils..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("texture", "custom", customTexture, setCustomTexture)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                      {state.texture.custom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.texture.custom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-[#9E8A78]/15 border border-[#9E8A78]/40 rounded-full text-xs text-[#6a5040]">
                              <span>{tag}</span>
                              <button onClick={() => removeCustomTag("texture", "custom", tag)} className="text-[#6a5040]/60 hover:text-red-600 transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. MOOD & SIZE RATIO STEP */}
                {currentStepIdx === 5 && (
                  <div className="flex flex-col gap-6" id="step-panel-mood">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-[#293140]">Mood & Frame Ratio</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 6</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Select overall editorial styles, professional color grades, and dimensions.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Photography / Editorial Style</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Editorial children's product photography",
                          "Cinematic portrait",
                          "Documentary, candid",
                          "Fashion editorial",
                          "Clean e-commerce product",
                          "Lifestyle, warm and organic",
                          "Vogue editorial aesthetic"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleChip("mood", "style", item)}
                            className={getChipClass(state.mood.style === item, "navy")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Spectrum Color Grade</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Warm neutral tones",
                          "Teal shadows, warm highlights",
                          "Bright and airy, minimal",
                          "Kodak Portra 400 color grade",
                          "Moody, desaturated",
                          "Natural, true-to-life",
                          "Soft pastel tones"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleChip("mood", "colorGrade", item)}
                            className={getChipClass(state.mood.colorGrade === item, "navy")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Imagen Output Ratio</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "1:1 square",
                          "4:5 portrait (1080x1350px)",
                          "16:9 landscape",
                          "9:16 vertical"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleChip("mood", "ratio", item)}
                            className={getChipClass(state.mood.ratio === item, "navy")}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">Custom Tone overrides</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customMood}
                          onChange={(e) => setCustomMood(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("mood", "custom", customMood, setCustomMood)}
                          placeholder="e.g. sepia dust overlays, muted champagne color tones..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("mood", "custom", customMood, setCustomMood)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                      {state.mood.custom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.mood.custom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-atlas-navy text-white rounded-full text-xs">
                              <span>{tag}</span>
                              <button onClick={() => removeCustomTag("mood", "custom", tag)} className="text-white/70 hover:text-[#C9A84C] transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. NEGATIVES STEP */}
                {currentStepIdx === 7 || currentStepIdx === 6 && (
                  <div className="flex flex-col gap-6" id="step-panel-negatives">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <h2 className="text-lg font-serif-accent font-medium text-[#293140]">Exclusion Directives (Negatives)</h2>
                        <span className="bg-atlas-surface2 text-atlas-slate text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-mono">Step 7</span>
                      </div>
                      <p className="text-xs text-atlas-slate">Filter and exclude unwanted details, synthetic structures, plastic wax sheen, or distorted entities.</p>
                      <hr className="border-atlas-border mt-3" />
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Anti-wax Face & Skin anomalies</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "--no plastic skin",
                          "--no smooth complexion",
                          "--no flawless skin",
                          "--no dead eyes",
                          "--no wax look",
                          "--no uncanny valley",
                          "--no perfect complexion"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("negative", "presets", item)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-all border ${
                              state.negative.presets.includes(item) 
                                ? "bg-red-50 border-red-300 text-red-700 font-medium" 
                                : "bg-atlas-surface border-atlas-border2 text-atlas-slate hover:border-red-400"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Hands & Body structure exclusions</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "--no extra fingers",
                          "--no distorted hands",
                          "--no double limbs",
                          "--no stiff pose",
                          "--no unnatural position"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("negative", "presets", item)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-all border ${
                              state.negative.presets.includes(item) 
                                ? "bg-red-50 border-red-300 text-red-700 font-medium" 
                                : "bg-atlas-surface border-atlas-border2 text-atlas-slate hover:border-red-400"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Digital Quality artifacts</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "--no watermarks",
                          "--no text overlays",
                          "--no blurry faces",
                          "--no digital artifacts",
                          "--no low resolution",
                          "--no oversaturation",
                          "--no lens flare",
                          "--no vignette"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("negative", "presets", item)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-all border ${
                              state.negative.presets.includes(item) 
                                ? "bg-red-50 border-red-300 text-red-700 font-medium" 
                                : "bg-atlas-surface border-atlas-border2 text-atlas-slate hover:border-red-400"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase mb-2.5">Art Styles / Sheen filters</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "--no cartoon look",
                          "--no HDR glow",
                          "--no artificial sheen",
                          "--no fake neon",
                          "--no dark shadows on packaging",
                          "--no color banding",
                          "--no floating shadows"
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleMultiChip("negative", "presets", item)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-all border ${
                              state.negative.presets.includes(item) 
                                ? "bg-red-50 border-red-300 text-red-700 font-medium" 
                                : "bg-atlas-surface border-atlas-border2 text-atlas-slate hover:border-red-400"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">Describe custom exclusions</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customNegative}
                          onChange={(e) => setCustomNegative(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag("negative", "custom", customNegative.startsWith("--no") ? customNegative : "--no " + customNegative, setCustomNegative)}
                          placeholder="e.g. paint brush strokes, plastic reflections..."
                          className="flex-1 bg-atlas-bg/60 border border-atlas-border2 rounded-lg py-2 px-3.5 text-xs text-atlas-navy placeholder:text-atlas-grey outline-none focus:border-atlas-navy focus:bg-atlas-surface transition-all"
                        />
                        <button
                          onClick={() => addCustomTag("negative", "custom", customNegative.startsWith("--no") ? customNegative : "--no " + customNegative, setCustomNegative)}
                          className="bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate px-4 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                        >
                          Exclude
                        </button>
                      </div>
                      {state.negative.custom.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 p-1.5 bg-atlas-bg/30 rounded-lg border border-atlas-border border-dashed">
                          {state.negative.custom.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-red-55 border border-red-200 text-red-700 rounded-full text-xs">
                              <span className="font-mono">{tag}</span>
                              <button onClick={() => removeCustomTag("negative", "custom", tag)} className="text-red-700/60 hover:text-red-900 transition-colors text-[10px] font-bold p-0.5 ml-1">
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Horizontal Step Buttons */}
                <div className="flex items-center justify-between gap-4 mt-auto pt-6 border-t border-atlas-border">
                  <button
                    disabled={currentStepIdx === 0}
                    onClick={() => {
                      setCurrentStepIdx(prev => Math.max(0, prev - 1));
                      setGenerationError(null);
                    }}
                    className={`px-4 py-2 text-xs rounded-md font-medium border border-atlas-border2 flex items-center gap-1.5 ${
                      currentStepIdx === 0 
                        ? "opacity-50 cursor-not-allowed bg-atlas-bg text-atlas-grey" 
                        : "bg-white text-atlas-slate hover:border-atlas-navy hover:text-atlas-navy cursor-pointer transition-colors"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    disabled={currentStepIdx === STEPS.length - 1}
                    onClick={() => {
                      setCurrentStepIdx(prev => Math.min(STEPS.length - 1, prev + 1));
                      setGenerationError(null);
                    }}
                    className={`px-5 py-2 text-xs rounded-md font-medium border flex items-center gap-1.5 transition-colors ${
                      currentStepIdx === STEPS.length - 1 
                        ? "opacity-50 cursor-not-allowed bg-atlas-bg border-atlas-border text-atlas-grey" 
                        : "bg-atlas-navy text-white border-atlas-navy hover:bg-atlas-slate hover:border-atlas-slate cursor-pointer"
                    }`}
                  >
                    <span>Next: {currentStepIdx < STEPS.length - 1 ? STEPS[currentStepIdx + 1].label : "Finish"}</span>
                    <ChevronRight className="w-4 h-4 text-atlas-gold" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          </>
          )}
        </section>

        {/* Right Side: Studio Preview Workspace & Canvas (5 columns on desktop) */}
        <section className="col-span-1 lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-[90px]">
          
          {/* Studio Canvas Card */}
          <div className="bg-atlas-surface border border-atlas-border rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-atlas-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C] animate-pulse" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-atlas-slate font-sans">IMAGEN 3 Workspace</h3>
              </div>
              <span className="text-[10px] text-[#9E8A78] font-mono font-medium">Aspect Ratio: {state.mood.ratio ? state.mood.ratio.split(" ")[0] : "1:1"}</span>
            </div>

            {/* Generated Image Canvas Target Box */}
            <div className="flex items-center justify-center bg-atlas-bg/40 rounded-xl overflow-hidden border border-atlas-border2 relative p-4 group transition-shadow duration-350 shadow-inner">
              
              {/* Aspect Ratio Box Wrapper */}
              <div className={`w-full max-w-full flex items-center justify-center transition-all duration-300 relative bg-atlas-surface2/30 shadow-subtle ${currentRatioClass()}`}>
                
                {/* 1. Loader screen overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-atlas-navy2/95 text-white z-20 flex flex-col items-center justify-center p-6 text-center shadow-lg transition-all">
                    <div className="relative mb-4 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-atlas-gold/25 border-t-atlas-gold animate-spin" />
                      <Sparkles className="w-5 h-5 text-atlas-gold absolute animate-pulse" />
                    </div>
                    <motion.p 
                      key={loadingText}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-serif-accent italic text-atlas-sand max-w-[200px]"
                    >
                      {loadingText}
                    </motion.p>
                    <span className="text-[9px] text-[#9F9E9F] uppercase tracking-widest font-mono mt-3 animate-pulse">Imagen 3 Active</span>
                  </div>
                )}

                {/* 2. Error Panel overlay */}
                {generationError && (
                  <div className="absolute inset-0 bg-red-50 text-red-900 border border-red-200 rounded-lg p-6 z-10 flex flex-col justify-center items-center text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-2.5" />
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-red-950">Synthesis Failed</h4>
                    <p className="text-[11px] text-red-800 leading-normal max-w-xs mb-3">{generationError}</p>
                    <button 
                      onClick={handleGenerate}
                      className="bg-red-800 hover:bg-red-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Retry Generation
                    </button>
                  </div>
                )}

                {/* 3. Empty State or Render state */}
                {!generatedImg ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-atlas-grey">
                    <div className="p-4 rounded-full bg-atlas-surface border border-atlas-border border-dashed mb-3">
                      <ImageIcon className="w-8 h-8 text-atlas-taupe" />
                    </div>
                    <span className="font-serif-accent font-medium text-sm text-atlas-slate block mb-1">Canvas Uninitialized</span>
                    <p className="text-[11px] text-atlas-grey leading-relaxed max-w-[200px]">
                      Configure parameters and press <span className="font-semibold text-atlas-slate">✦ Generate</span> to trigger photorealistic Imagen rendering.
                    </p>
                  </div>
                ) : (
                  <img
                    referrerPolicy="no-referrer"
                    src={generatedImg}
                    alt="Atlas Generated Artwork"
                    className="w-full h-full object-cover select-none"
                  />
                )}
                
                {/* Premium watermark tag inside canvas */}
                {generatedImg && (
                  <div className="absolute bottom-3 right-3 bg-atlas-navy/80 backdrop-blur text-white text-[9px] py-1 px-2.5 rounded font-mono uppercase tracking-widest text-shadow transition-opacity opacity-20 hover:opacity-100">
                    Imagen 3 — ATLAS
                  </div>
                )}

              </div>
            </div>

            {/* Canvas Actions */}
            {generatedImg && (
              <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-3">
                <a
                  href={generatedImg}
                  download={`atlas-imagen3-${Date.now()}.jpg`}
                  className="flex-1 bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy hover:text-atlas-navy text-atlas-slate text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-atlas-gold" />
                  <span>Download Image</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsEditingImg(true)}
                  className="flex-1 bg-atlas-navy hover:bg-atlas-navy2 hover:text-white border border-transparent text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                  id="canvas-action-edit"
                >
                  <Sparkles className="w-3.5 h-3.5 text-atlas-gold animate-pulse" />
                  <span>AI Mask & Edit (Inpaint)</span>
                </button>
              </div>
            )}

            {/* Prompt Editor */}
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#9E8A78] tracking-widest uppercase">
                <span>Active compiled Prompt</span>
                <button
                  disabled={isAnalyzingPrompt || !editedPrompt.trim()}
                  onClick={handleRefinePromptWithAI}
                  className="font-mono text-[9px] text-atlas-navy hover:text-[#293140] px-2 py-0.5 bg-[#C9A84C] border border-[#C9A84C]/35 rounded font-bold uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {isAnalyzingPrompt ? (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                      <span>Refining...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />
                      <span className="text-white">✦ AI Refine</span>
                    </>
                  )}
                </button>
              </div>
              
              <textarea
                value={editedPrompt}
                onChange={(e) => {
                  setEditedPrompt(e.target.value);
                  setIsPromptEdited(true);
                }}
                placeholder="The compiled prompt will appear here as you toggle options..."
                className="w-full min-h-[110px] p-3 text-[11px] md:text-[12px] font-mono leading-relaxed bg-atlas-surface2/45 border border-atlas-border2 rounded-lg text-atlas-navy outline-none focus:border-atlas-navy focus:bg-atlas-surface resize-none"
              />

              {/* Action Buttons inside workspace */}
              <div className="flex flex-col gap-2 mt-1">
                <button
                  disabled={isGenerating || !editedPrompt.trim()}
                  onClick={handleGenerate}
                  className={`w-full py-3 px-4 rounded-lg text-xs font-semibold text-white tracking-wider uppercase transition-all shadow cursor-pointer flex items-center justify-center gap-2 ${
                    isGenerating || !editedPrompt.trim()
                      ? "bg-atlas-grey cursor-not-allowed"
                      : "bg-atlas-navy border border-atlas-navy hover:bg-[#1e2535] active:scale-[0.99] hover:border-atlas-navy"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-atlas-gold animate-pulse" />
                  <span>{isGenerating ? "Synthesizing Image..." : "✦ Generate Image"}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyPrompt}
                    disabled={!editedPrompt}
                    className="flex-1 bg-atlas-surface border border-atlas-border2 hover:border-[#C9A84C] text-atlas-slate disabled:opacity-50 text-[11px] font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copyStatus ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600 font-semibold">✓ Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-atlas-gold" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveText}
                    disabled={!editedPrompt}
                    className="flex-1 bg-atlas-surface border border-atlas-border2 hover:border-atlas-navy text-atlas-slate disabled:opacity-50 text-[11px] font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-atlas-brown" />
                    <span>Save Prompt (.txt)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Historical Gallery list of past generated images */}
          {history.length > 0 && (
            <div className="bg-atlas-surface border border-atlas-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-atlas-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#9E8A78]" />
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-[#293140] font-sans">
                    Studio Gallery & Replications
                  </h4>
                </div>
                <span className="text-[10px] text-atlas-grey font-mono">{history.length} items</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {history.map((record) => {
                  const isActive = generatedImg === record.url;
                  const isSaved = savedImageIds.includes(record.id);
                  return (
                    <div
                      key={record.id}
                      onClick={() => handleSelectHistoryItem(record)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all group shadow-sm hover:shadow-md ${
                        isActive ? "border-atlas-gold scale-[1.01]" : "border-atlas-border/80"
                      }`}
                    >
                      <img referrerPolicy="no-referrer" src={record.url} alt="Gallery Render" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      {/* Premium Hover Overlay panel */}
                      <div className="absolute inset-0 bg-atlas-navy/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white z-10">
                        {/* Top row actions */}
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono uppercase bg-atlas-gold/25 text-atlas-gold px-1.5 py-0.5 rounded tracking-widest leading-none">
                            {record.ratio ? record.ratio.split(" ")[0] : "1:1"}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {/* Bookmark Star/Heart Toggle */}
                            <button
                              onClick={(e) => handleToggleSaveImage(e, record.id)}
                              className="p-1 hover:text-atlas-gold text-white/80 transition-colors cursor-pointer"
                              title={isSaved ? "Remove from Saved" : "Save Image to Favorites"}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-atlas-gold text-atlas-gold" : ""}`} />
                            </button>

                            {/* Download file */}
                            <a
                              href={record.url}
                              download={`atlas-imagen-${record.id}.jpg`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 hover:text-white text-white/80 transition-colors cursor-pointer"
                              title="Download Image File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete item */}
                            <button
                              onClick={(e) => handleClearHistoryItem(e, record.id)}
                              className="p-1 hover:text-red-500 text-red-400 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Middle Prompt Text */}
                        <div className="flex-1 flex items-end mb-2">
                          <p className="text-[9px] leading-relaxed font-mono italic text-atlas-sand/90 line-clamp-3">
                            {record.prompt}
                          </p>
                        </div>

                        {/* Bottom CTA Row: Generate Variations */}
                        <button
                          disabled={isGenerating || isGeneratingVariation}
                          onClick={(e) => handleGenerateVariation(e, record)}
                          className="w-full py-1.5 bg-[#C9A84C] hover:bg-[#bfa043] rounded text-[9px] font-bold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Generate Variations</span>
                        </button>
                      </div>

                      {/* Fallback indicators if not hovered */}
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] py-0.5 px-1.5 rounded font-mono uppercase group-hover:opacity-0 transition-opacity">
                        {record.ratio ? record.ratio.split(" ")[0] : "1:1"}
                      </div>

                      {isSaved && (
                        <div className="absolute top-2 right-2 bg-atlas-gold text-atlas-navy p-1 rounded-full shadow-md group-hover:opacity-0 transition-opacity">
                          <Heart className="w-2.5 h-2.5 fill-atlas-navy" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Floating config drawer overlays help users bind key easily */}
      <AnimatePresence>
        {(showConfigHelp || serverHasKey === false) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-atlas-surface border border-atlas-border rounded-xl shadow-xl max-w-md w-full p-6 text-center"
            >
              <AlertCircle className="w-12 h-12 text-[#C9A84C] mx-auto mb-3" />
              <h3 className="text-lg font-serif-accent font-semibold text-atlas-navy mb-2">
                Gemini API Key Needed
              </h3>
              <p className="text-xs text-atlas-slate leading-relaxed mb-4">
                This photorealistic studio uses Google's latest <span className="font-semibold">Imagen 3</span> engine. To make models generate correctly under your sandboxed container environment, please proceed as follows:
              </p>
              <div className="bg-atlas-bg rounded-lg p-4 text-left text-[11px] text-atlas-slate flex flex-col gap-2 border border-atlas-border mb-4">
                <div className="flex gap-2">
                  <span className="font-bold text-[#9E8A78]">1.</span> 
                  <span>Obtain an API Key from Google AI Studio.</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-[#9E8A78]">2.</span> 
                  <span>Click <span className="font-semibold">Settings (gear icon) &gt; Secrets</span> at the top of AI Studio chat UI.</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-[#9E8A78]">3.</span> 
                  <span>Add a new secret called <code className="bg-atlas-surface px-1 py-0.5 border rounded text-[#a020f0]">GEMINI_API_KEY</code> containing your key.</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold text-[#9E8A78]">4.</span> 
                  <span>Refresh this browser page. Your studio will activate instantly!</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    // Try to re-check if key is configured
                    fetch("/api/config")
                      .then((r) => r.json())
                      .then((data) => {
                        if (data.hasApiKey) {
                          setServerHasKey(true);
                          setShowConfigHelp(false);
                        } else {
                          // Still no key
                          alert("No API key detected yet. Please add GEMINI_API_KEY to AI Studio Secrets first.");
                        }
                      });
                  }}
                  className="flex-1 bg-atlas-navy hover:bg-atlas-slate text-white text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Registered Key
                </button>
                <button
                  onClick={() => setShowConfigHelp(false)}
                  className="flex-1 bg-atlas-surface border border-atlas-border text-atlas-slate hover:bg-atlas-bg text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss Overlay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-atlas-border mt-auto py-5 text-center text-[10px] text-atlas-grey px-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto">
        <span>© 100% Client-Authoritative Prompt Matrix. Rendered using Google Cloud and Imagen 3.</span>
        <div className="flex items-center gap-1">
          <span>Aesthetic curated with</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
          <span>for Melanie Dages.</span>
        </div>
      </footer>

      {/* Modern AI Masking & Inpainting Editor Canvas Overlay */}
      <AnimatePresence>
        {isEditingImg && generatedImg && (
          <AIImageEditor
            imageUrl={generatedImg}
            onClose={() => setIsEditingImg(false)}
            onSave={(newImgUrl) => {
              setGeneratedImg(newImgUrl);
              setIsEditingImg(false);
              
              // Record and sync newly stitched image into project sequence logs
              const record: GeneratedImageRecord = {
                id: String(Date.now()),
                url: newImgUrl,
                prompt: "AI Inpaint / Masked Region Edit",
                timestamp: Date.now(),
                ratio: state.mood.ratio || "1:1"
              };
              const updatedHistory = [record, ...history.slice(0, 19)];
              setHistory(updatedHistory);
              localStorage.setItem("atlas_image_history", JSON.stringify(updatedHistory));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
