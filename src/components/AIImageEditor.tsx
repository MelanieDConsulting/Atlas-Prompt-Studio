import React, { useRef, useState, useEffect } from "react";
import { 
  X, 
  Check, 
  Trash2, 
  Undo2, 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIImageEditorProps {
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
  onClose: () => void;
}

export function AIImageEditor({ imageUrl, onSave, onClose }: AIImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolMode, setToolMode] = useState<"brush" | "eraser">("brush");
  const [editType, setEditType] = useState<"insert_edit" | "removal">("insert_edit");
  const [prompt, setPrompt] = useState("");
  const [maskVisible, setMaskVisible] = useState(true);
  
  // History stack for drawn masks (to support multi-step Undo)
  const [history, setHistory] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mouse / Brush overlay preview coordinates
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load the image to determine natural dimensions and trigger layout
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      imageRef.current = img;
      setImageLoaded(true);
      setErrorMessage(null);
    };
    img.onerror = () => {
      setErrorMessage("Could not load reference image for editing.");
    };
  }, [imageUrl]);

  // Adjust display canvases relative to container and image aspect ratio
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !containerRef.current) return;

    const setupCanvases = () => {
      const container = containerRef.current;
      if (!container) return;

      const contWidth = container.clientWidth;
      const contHeight = container.clientHeight;

      const imgWidth = imageRef.current!.naturalWidth;
      const imgHeight = imageRef.current!.naturalHeight;

      // Fit the image aspect ratio into the container bounds
      const ratio = Math.min(contWidth / imgWidth, contHeight / imgHeight);
      const displayWidth = Math.round(imgWidth * ratio);
      const displayHeight = Math.round(imgHeight * ratio);

      // Set canvas dimension properties explicitly
      const mainCanvas = mainCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      if (mainCanvas && maskCanvas) {
        mainCanvas.width = displayWidth;
        mainCanvas.height = displayHeight;
        mainCanvas.style.width = `${displayWidth}px`;
        mainCanvas.style.height = `${displayHeight}px`;

        // Only instantiate the mask canvas if it hasn't been set up yet,
        // or resize it while keeping its content using a temporary transfer
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = maskCanvas.width;
        tempCanvas.height = maskCanvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx && maskCanvas.width > 0) {
          tempCtx.drawImage(maskCanvas, 0, 0);
        }

        maskCanvas.width = displayWidth;
        maskCanvas.height = displayHeight;
        maskCanvas.style.width = `${displayWidth}px`;
        maskCanvas.style.height = `${displayHeight}px`;

        const maskCtx = maskCanvas.getContext("2d")!;
        maskCtx.lineCap = "round";
        maskCtx.lineJoin = "round";

        // Restore mask on resize if there is pre-existing content
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          maskCtx.drawImage(tempCanvas, 0, 0, displayWidth, displayHeight);
        }

        drawAll();
      }
    };

    setupCanvases();
    window.addEventListener("resize", setupCanvases);
    
    return () => {
      window.removeEventListener("resize", setupCanvases);
    };
  }, [imageLoaded, maskVisible]);

  // Redraw main display canvas including the background image and mask layer
  const drawAll = () => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas || !imageRef.current) return;

    const ctx = mainCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    // 1. Draw base original image
    ctx.drawImage(imageRef.current, 0, 0, mainCanvas.width, mainCanvas.height);

    // 2. Draw mask preview as overlay on top
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas && maskVisible) {
      ctx.save();
      ctx.globalAlpha = 0.55; // Semi-transparent overlay
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.restore();
    }
  };

  // Triggered on canvas drawing path start (Mouse/Touch down)
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setErrorMessage(null);

    // Save history state before starting new stroke
    saveHistoryState();

    const rect = maskCanvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.save();
    if (toolMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#EF4444"; // Vivid scarlet red mask indicator
    }

    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    drawAll();
  };

  // Triggered on active drawing drag (Mouse/Touch move)
  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const rect = maskCanvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent scrolling while drawing on mobile
      if (e.cancelable) e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Track mouse coordinates for visual brush cursor overlay
    setMousePos({ x, y });

    if (!isDrawing) return;

    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    if (toolMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#EF4444";
    }

    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    drawAll();
  };

  // Drawing finished
  const handleEndDraw = () => {
    setIsDrawing(false);
    drawAll();
  };

  // Capture canvas state into the Undo history stack
  const saveHistoryState = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const dataUrl = maskCanvas.toDataURL();
    setHistory((prev) => [...prev, dataUrl].slice(-15)); // Keep last 15 actions
  };

  // Perform Undo action
  const handleUndo = () => {
    if (history.length === 0) return;

    const previousStateUrl = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    const img = new Image();
    img.src = previousStateUrl;
    img.onload = () => {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      drawAll();
    };
  };

  // Erase whole mask canvas
  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    // Store in undo before erasing
    saveHistoryState();

    const ctx = maskCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    drawAll();
    setErrorMessage(null);
  };

  // Compile Drawn Mask + Base Image & submit to /api/edit endpoint
  const handleApplyAIEdit = async () => {
    if (!prompt.trim() && editType !== "removal") {
      setErrorMessage("Please write a text description of what you want to add or modify inside the mask.");
      return;
    }

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !imageRef.current) return;

    // Validate that the user actually painted something
    const checkCtx = maskCanvas.getContext("2d")!;
    const checkData = checkCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    let hasPaintedPixels = false;
    for (let i = 0; i < checkData.length; i += 4) {
      if (checkData[i + 3] > 0) {
        hasPaintedPixels = true;
        break;
      }
    }

    if (!hasPaintedPixels) {
      setErrorMessage("Please use the brush to highlight the region you want the AI to modify.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessStep(0);

    // Dynamic step messages
    const stepInterval = setInterval(() => {
      setProcessStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 2800);

    try {
      // 1. Generate full-resolution black-and-white binary mask
      const outMaskCanvas = document.createElement("canvas");
      outMaskCanvas.width = naturalWidth;
      outMaskCanvas.height = naturalHeight;
      const outMaskCtx = outMaskCanvas.getContext("2d")!;

      // Background filled with pitch black
      outMaskCtx.fillStyle = "#000000";
      outMaskCtx.fillRect(0, 0, naturalWidth, naturalHeight);

      // Draw active mask scaled to full resolution
      outMaskCtx.drawImage(maskCanvas, 0, 0, naturalWidth, naturalHeight);

      // Convert semi-transparent scarlet to pure solid binary white (#FFFFFF) for masked area, black otherwise (#000000)
      const outImgData = outMaskCtx.getImageData(0, 0, naturalWidth, naturalHeight);
      const outData = outImgData.data;

      for (let i = 0; i < outData.length; i += 4) {
        const r = outData[i];
        const g = outData[i + 1];
        const b = outData[i + 2];
        const alpha = outData[i + 3];

        // If it was painted (red background drawn or any transparent source), make it pure white
        // Note: the filled black background is at outData[i] = 0, but when mask values overlay it, they introduce alpha/color
        if (alpha > 0 && (r > 10 || g > 10 || b > 10 || alpha > 10)) {
          outData[i] = 255;
          outData[i + 1] = 255;
          outData[i + 2] = 255;
          outData[i + 3] = 255;
        } else {
          outData[i] = 0;
          outData[i + 1] = 0;
          outData[i + 2] = 0;
          outData[i + 3] = 255;
        }
      }
      outMaskCtx.putImageData(outImgData, 0, 0);

      const compiledMaskBase64 = outMaskCanvas.toDataURL("image/png");

      // Construct a final prompt tailored to removal vs insertion
      const finalPrompt = editType === "removal" 
        ? (prompt.trim() ? `remove ${prompt}` : "remove highlighted object cleanly, infill and blend naturally with surrounding background") 
        : prompt;

      // Submit Payload to fullstack endpoint
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageUrl,
          mask: compiledMaskBase64,
          prompt: finalPrompt,
          editMode: editType === "removal" ? "EDIT_MODE_INPAINT_REMOVAL" : "EDIT_MODE_INPAINT_INSERTION"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The AI model encountered an error modifying the selected region.");
      }

      if (data.imageUrl) {
        clearInterval(stepInterval);
        onSave(data.imageUrl);
      } else {
        throw new Error("No edited image URL returned from the AI model.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to communicate with editing server. Please ensure secrets match.");
    } finally {
      clearInterval(stepInterval);
      setIsProcessing(false);
    }
  };

  // Cycle of loaders
  const loadTitles = [
    "Vectorizing source canvas...",
    "Realigning semantic masks...",
    "Blending pixel weights...",
    "Executing final inpainting render..."
  ];

  return (
    <div className="fixed inset-0 z-50 bg-atlas-navy/95 backdrop-blur-md flex flex-col md:flex-row text-white font-sans overflow-hidden">
      
      {/* LEFT: Drawing Board Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative select-none">
        
        {/* Navigation Indicator & Back Button */}
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-white hover:text-atlas-gold cursor-pointer"
            id="editor-btn-close"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-serif-accent font-medium text-white tracking-wide">AI Generative Patchwork</h2>
            <p className="text-[10px] text-atlas-grey font-mono uppercase tracking-widest">Inpaint / Outpaint Canvas</p>
          </div>
        </div>

        {/* Mask toggle quick setting */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/5 rounded-lg p-1 border border-white/10 text-xs">
          <button
            onClick={() => setMaskVisible(true)}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${maskVisible ? 'bg-atlas-gold text-atlas-navy font-semibold' : 'text-atlas-grey hover:text-white'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Mask</span>
          </button>
          <button
            onClick={() => setMaskVisible(false)}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${!maskVisible ? 'bg-atlas-gold text-atlas-navy font-semibold' : 'text-atlas-grey hover:text-white'}`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide Mask</span>
          </button>
        </div>

        {/* Central interactive canvas board */}
        <div 
          ref={containerRef}
          className="w-full max-w-2xl h-[60vh] md:h-[75vh] flex items-center justify-center relative touch-none bg-black/40 rounded-xl border border-white/5 shadow-2xl p-2 mt-12 md:mt-0"
        >
          {!imageLoaded ? (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-atlas-gold animate-spin" />
              <p className="text-xs text-atlas-grey font-mono">Calibrating workspace variables...</p>
            </div>
          ) : (
            <div className="relative overflow-hidden shadow-2xl cursor-crosshair">
              {/* Main merged display canvas */}
              <canvas
                id="image-editor-main-canvas"
                ref={mainCanvasRef}
                className="block outline-none"
              />

              {/* Hidden/Overlay scratchpad canvas specifically for drawing the mask */}
              <canvas
                id="image-editor-mask-canvas"
                ref={maskCanvasRef}
                className="absolute inset-0 pointer-events-auto opacity-0"
                onMouseDown={handleStartDraw}
                onMouseMove={handleMoveDraw}
                onMouseUp={handleEndDraw}
                onMouseLeave={handleEndDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleMoveDraw}
                onTouchEnd={handleEndDraw}
              />

              {/* Custom CSS Hover Brush Preview Ring */}
              {mousePos && !isDrawing && (
                <div
                  className="absolute pointer-events-none rounded-full border-2 border-white mix-blend-difference"
                  style={{
                    left: mousePos.x - brushSize / 2,
                    top: mousePos.y - brushSize / 2,
                    width: brushSize,
                    height: brushSize,
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Quick Help Label */}
        <div className="mt-2 text-center max-w-md hidden md:block">
          <p className="text-[11px] text-atlas-grey leading-relaxed flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-atlas-gold shrink-0" />
            <span>Brush over any area you wish comfort-blended, then define what you wish to change on the panel on the right.</span>
          </p>
        </div>
      </div>

      {/* RIGHT: AI Parameters and Actions Sidebar */}
      <div className="w-full md:w-96 bg-atlas-navy2 border-t md:border-t-0 md:border-l border-white/10 p-5 flex flex-col justify-between shrink-0 h-auto md:h-full overflow-y-auto">
        <div className="flex flex-col gap-5">
          {/* Section: Workspace Modes */}
          <div>
            <span className="text-[10px] font-bold text-atlas-gold tracking-widest uppercase block mb-2.5">Edit Strategy</span>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setEditType("insert_edit")}
                className={`py-2 px-3 rounded text-center cursor-pointer transition-all ${editType === "insert_edit" ? 'bg-white/10 text-white font-semibold' : 'text-atlas-grey hover:text-white text-xs'}`}
              >
                <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                <span className="text-xs">Add / Modify</span>
              </button>
              <button
                onClick={() => setEditType("removal")}
                className={`py-2 px-3 rounded text-center cursor-pointer transition-all ${editType === "removal" ? 'bg-white/10 text-white font-semibold' : 'text-atlas-grey hover:text-white text-xs'}`}
              >
                <Trash2 className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                <span className="text-xs">Erase Element</span>
              </button>
            </div>
          </div>

          {/* Section: Manual Canvas Brush Controls */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-atlas-gold tracking-widest uppercase mb-2">
              <span>Mask Tools</span>
              <span className="text-atlas-grey font-mono">{brushSize}px brush</span>
            </div>

            {/* Slider and Mode selectors */}
            <div className="flex flex-col gap-3 bg-white/5 rounded-xl border border-white/5 p-3.5">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-atlas-grey" />
                <input
                  type="range"
                  min="6"
                  max="120"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="flex-1 accent-atlas-gold cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
                />
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-center justify-between gap-2 text-xs">
                {/* Brush / Eraser select */}
                <div className="flex rounded bg-black/20 p-0.5">
                  <button
                    onClick={() => setToolMode("brush")}
                    className={`py-1 px-3 rounded transition-all cursor-pointer ${toolMode === "brush" ? 'bg-atlas-gold text-atlas-navy font-semibold' : 'text-atlas-grey hover:text-white'}`}
                  >
                    Brush
                  </button>
                  <button
                    onClick={() => setToolMode("eraser")}
                    className={`py-1 px-3 rounded transition-all cursor-pointer ${toolMode === "eraser" ? 'bg-atlas-gold text-atlas-navy font-semibold' : 'text-atlas-grey hover:text-white'}`}
                  >
                    Eraser
                  </button>
                </div>

                {/* Undo / Clear operations */}
                <div className="flex gap-1">
                  <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/15 disabled:opacity-20 transition-all text-white cursor-pointer"
                    title="Undo stroke"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClearMask}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Clear mask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Text prompt input tailored */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-atlas-gold tracking-widest uppercase mb-1.5">
              <span>{editType === "insert_edit" ? "What should AI place here?" : "Object removal details (Optional)"}</span>
              <span className="text-[9px] text-atlas-grey font-mono lowercase">Imagen 3</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={editType === "insert_edit" 
                ? "e.g. 'add a red baseball hat', 'make the phone vintage carbon-fiber', 'change background to warm brick wall'" 
                : "e.g. 'remove the cup and fill with wooden desk', or leave empty for smart auto-infill"}
              className="w-full text-xs bg-black/30 text-white rounded-lg border border-white/10 p-3 outline-none focus:border-atlas-gold transition-all placeholder:text-atlas-grey h-28 resize-none leading-relaxed"
            />
          </div>

          {/* Feedback section: Error display */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-red-950/40 border border-red-500/30 rounded-lg p-3 text-red-200 text-xs flex gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM: Actions and Loader */}
        <div className="mt-6 flex flex-col gap-3">
          {isProcessing ? (
            <div className="flex flex-col bg-white/5 border border-white/5 p-4 rounded-xl gap-2.5">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-atlas-gold animate-spin shrink-0" />
                <span className="text-xs font-mono font-medium text-white">{loadTitles[processStep]}</span>
              </div>
              <div className="w-full bg-white/15 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-atlas-gold h-full transition-all duration-1000 ease-out"
                  style={{ width: `${(processStep + 1) * 25}%` }}
                />
              </div>
              <span className="text-[10px] text-atlas-grey italic text-center block leading-relaxed mt-1">
                Aligning light vectors and ambient scales for high-fidelity photorealistic fusion.
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-xs bg-white/5 border border-white/10 active:bg-white/10 hover:border-white/30 text-white font-semibold rounded-lg transition-all cursor-pointer"
                id="editor-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAIEdit}
                className="flex-1 py-3 text-xs bg-atlas-gold hover:bg-[#Bca044] active:scale-[0.98] text-atlas-navy font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-atlas-gold/15"
                id="editor-btn-apply"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply AI Edit</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
