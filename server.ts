import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, RawReferenceImage, MaskReferenceImage } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Initialize Express app
const app = express();
const PORT = 3000;

// Body parser middleware with safe request ceiling limit
app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI client (safely checks key on endpoint call)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Endpoint for checking configuration status
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Endpoint for image generation using Imagen 3
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, ratio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required to generate an image." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(403).json({
        error: "GEMINI_API_KEY environment variable is not configured on the server. Please visit 'Settings > Secrets' on Google AI Studio to set it.",
      });
    }

    // Map ratio strings: e.g. "1:1 square", "16:9 landscape", etc. to standard GenAI aspect ratios
    let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
    if (ratio) {
      if (ratio.includes("1:1")) aspectRatio = "1:1";
      else if (ratio.includes("3:4")) aspectRatio = "3:4";
      else if (ratio.includes("4:3")) aspectRatio = "4:3";
      else if (ratio.includes("9:16")) aspectRatio = "9:16";
      else if (ratio.includes("16:9")) aspectRatio = "16:9";
    }

    console.log(`Sending Prompt to Imagen 3 (Model: imagen-3.0-generate-002) with Aspect Ratio: ${aspectRatio}`);

    // Call standard generateImages using the correct Imagen model as instructed by guidelines
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: aspectRatio,
      },
    });

    if (!response?.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No generated image was returned by the Imagen API.");
    }

    const base64Bytes = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error("Error generating image via Google GenAI SDK:", error);
    return res.status(500).json({
      error: error?.message || "An unexpected error occurred during image generation with Imagen 3.",
    });
  }
});

// Helper to fetch/convert any URL or DataURI to base64 bytes for Google GenAI SDK
async function getImageBase64(imgUrl: string): Promise<{ base64: string; mimeType: string }> {
  if (imgUrl.startsWith("data:")) {
    const match = imgUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], base64: match[2] };
    }
    throw new Error("Invalid format for Data URI image.");
  }

  // Fetch external hosted image
  const response = await fetch(imgUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch referenced image from: ${imgUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  return {
    mimeType,
    base64: buffer.toString("base64")
  };
}

// Endpoint for image editing (inpainting and selective region modification) using Imagen 3
app.post("/api/edit-image", async (req, res) => {
  try {
    const { image, mask, prompt, editMode } = req.body;

    if (!image || !mask || !prompt) {
      return res.status(400).json({ error: "Image, mask, and prompt are all required to edit an image." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(403).json({
        error: "GEMINI_API_KEY environment variable is not configured on the server. Please visit 'Settings > Secrets' on Google AI Studio to set it.",
      });
    }

    console.log(`Processing and fetching image source bytes...`);
    const originalImage = await getImageBase64(image);
    const maskImage = await getImageBase64(mask);

    console.log(`Sending edited region request to Imagen 3 (Model: imagen-3.0-capability-editing-002) with prompt: "${prompt}"`);

    // Instantiate RawReferenceImage for the base canvas
    const rawRef = new RawReferenceImage();
    rawRef.referenceImage = {
      imageBytes: originalImage.base64,
      mimeType: originalImage.mimeType,
    };
    rawRef.referenceId = 1;

    // Instantiate MaskReferenceImage to specify where the AI modifies things
    const maskRef = new MaskReferenceImage();
    maskRef.referenceImage = {
      imageBytes: maskImage.base64,
      mimeType: maskImage.mimeType,
    };
    maskRef.config = {
      // Prompt the model to modify exclusively where the user drew the mask
      maskMode: "MASK_MODE_USER_PROVIDED" as any,
    };
    maskRef.referenceId = 2;

    // Choose target compile mode: inpaint removal vs standard insertion/modification
    const chosenEditMode = editMode === "EDIT_MODE_INPAINT_REMOVAL" 
      ? "EDIT_MODE_INPAINT_REMOVAL" 
      : "EDIT_MODE_INPAINT_INSERTION";

    // Call editImage from the modern @google/genai SDK
    const response = await ai.models.editImage({
      model: "imagen-3.0-capability-editing-002",
      prompt: prompt,
      referenceImages: [rawRef, maskRef],
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        editMode: chosenEditMode as any,
      }
    });

    if (!response?.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No edited image was returned by the Imagen API.");
    }

    const base64Bytes = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error("Error editing image via Google GenAI SDK:", error);
    return res.status(500).json({
      error: error?.message || "An unexpected error occurred during image editing with Imagen 3.",
    });
  }
});

// Endpoint for Quick Generate Prompt using Gemini 3.5 Flash
app.post("/api/quick-generate-prompt", async (req, res) => {
  try {
    const { refImageOutput, refImageProduct, refImageExtras, extraContext, selectedStyles } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(403).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please set it in Settings > Secrets.",
      });
    }

    const parts: any[] = [];

    // Base director prompt
    const systemInstruction = `You are an expert AI image prompt writer specializing in photorealistic product and lifestyle photography for Gemini image generation.

Your task: analyze all the images provided of your desired scene/product reference and write a single complete, detailed, conversational prompt that Gemini can use to generate a photorealistic photograph.

Write the prompt as a direct instruction to Gemini — natural flowing paragraphs, not bullet points or labels. Start with "Generate a photorealistic..." or "Photorealistic lifestyle photograph of...".

The prompt must include:
1. A precise description of the subject (person or product) — describe exactly what you see: age, hair, clothing, expression, pose
2. A precise description of the product — every detail visible: brand, text, colors, materials, what shows through any window
3. The scene and framing — camera angle, shot distance, background description, depth of field
4. Lighting — type, direction, quality, mood
5. Camera technical specs — suggest realistic settings (camera body, lens, aperture, shutter speed, ISO)
6. Texture and realism notes — skin texture, surface materials, how to avoid the plastic/AI look
7. Photography style — editorial, lifestyle, e-commerce, etc.
8. A negative prompt line at the end starting with "--no" listing everything to avoid

Write the prompt exactly as a professional art director would brief a photographer. Be specific about every detail you observe in the images. The output must be indistinguishable from a real photograph.`;

    let styleH = "";
    if (selectedStyles && selectedStyles.length > 0) {
      styleH = `\n\nPhotography style preference: ${selectedStyles.join(", ")}`;
    }

    let extraH = "";
    if (extraContext && extraContext.trim()) {
      extraH = `\n\nAdditional context from user: ${extraContext.trim()}`;
    }

    parts.push({
      text: systemInstruction + styleH + extraH + "\n\nAnalyze the following reference images carefully and construct the ultimate detailed Imagen 3 generation prompt:"
    });

    // Helper to add base64 image chunk
    const addImagePart = async (imgData: { name: string; src: string }, label: string) => {
      try {
        const parsed = await getImageBase64(imgData.src);
        parts.push({ text: `${label} (${imgData.name}):` });
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.base64,
          },
        });
      } catch (err) {
        console.error(`Error loading image ${imgData.name}:`, err);
      }
    };

    if (refImageOutput) {
      await addImagePart(refImageOutput, "Desired output image (replicate scene layout, feel, color style)");
    }
    if (refImageProduct) {
      await addImagePart(refImageProduct, "Product image (feature this exact product in the scene)");
    }
    if (refImageExtras && Array.isArray(refImageExtras)) {
      for (let idx = 0; idx < refImageExtras.length; idx++) {
        await addImagePart(refImageExtras[idx], `Additional reference image ${idx + 1}`);
      }
    }

    parts.push({
      text: "Now write the complete photorealistic Gemini image generation prompt based on all the instructions and reference images above. Keep the structure conversational, descriptive, and highly photorealistic:"
    });

    console.log("Analyzing images to quick generate prompt...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts }
    });

    const resultPrompt = response.text || "Generate a photorealistic lifestyle photograph of the product.";
    return res.json({ prompt: resultPrompt.trim() });

  } catch (error: any) {
    console.error("Error analyzing prompt with Gemini:", error);
    return res.status(500).json({ error: error?.message || "An error occurred while generating the prompt using Gemini." });
  }
});

// Endpoint for refining a draft builder prompt using Gemini 3.5 Flash
app.post("/api/refine-builder-prompt", async (req, res) => {
  try {
    const { draftPrompt, refImageOutput, refImageProduct, refImageExtras } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(403).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please set it in Settings > Secrets.",
      });
    }

    const parts: any[] = [];
    parts.push({
      text: `You are an expert AI image prompt writer. Take this draft prompt and the attached reference images, then rewrite it as a polished, highly detailed, conversational photorealistic prompt for Gemini. Expand every detail based on what you can see in the images to make it look highly specific, organic, and professional, maintaining the exact options requested in the draft. Maintain the conversational paragraph structure. Return ONLY the refined prompt text without any introductory text, quotation marks or side commentary:\n\nDraft Prompt:\n${draftPrompt}`
    });

    const addImagePart = async (imgData: { name: string; src: string }, label: string) => {
      try {
        const parsed = await getImageBase64(imgData.src);
        parts.push({ text: `${label} (${imgData.name}):` });
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.base64,
          },
        });
      } catch (err) {
        console.error(`Error loading image ${imgData.name}:`, err);
      }
    };

    if (refImageOutput) {
      await addImagePart(refImageOutput, "Desired output reference");
    }
    if (refImageProduct) {
      await addImagePart(refImageProduct, "Product to feature");
    }
    if (refImageExtras && Array.isArray(refImageExtras)) {
      for (let idx = 0; idx < refImageExtras.length; idx++) {
        await addImagePart(refImageExtras[idx], `Additional reference ${idx + 1}`);
      }
    }

    parts.push({
      text: "Now rewrite the draft prompt to be extremely photorealistic and organic, incorporating the visual details of the reference images above:"
    });

    console.log("Refining builder-derived prompt...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts }
    });

    const refinedPrompt = response.text || draftPrompt;
    return res.json({ prompt: refinedPrompt.trim() });

  } catch (error: any) {
    console.error("Error refining builder prompt via Gemini:", error);
    return res.status(500).json({ error: error?.message || "An error occurred while refining your prompt with Gemini." });
  }
});

// Endpoint for generating variations (prompt expansion + image generation combined)
app.post("/api/generate-variation", async (req, res) => {
  try {
    const { prompt, ratio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Source prompt is required to generate variations." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(403).json({
        error: "GEMINI_API_KEY environment variable is not configured on the server. Please visit 'Settings > Secrets' on Google AI Studio to set it.",
      });
    }

    // 1. Utilize Gemini 3.5 Flash to create a subtle variation of the text prompt first
    console.log("Asking Gemini 3.5 Flash to produce a dynamic variation of prompt...");
    const variationResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert AI image prompt engineer. Translate the following existing image generation prompt into a subtle, high-quality, tasteful alternate version. Keep the core subject, product specifications, and overall composition identical, but apply a slight visual shift (for example, change the lighting angle, shift the time of day, vary minor background accessory objects or prop colors, or adjust camera focal length details slightly). Do not make dramatic changes. Return ONLY the new rewritten prompt text, and nothing else (no introductory phrases, no quotes, no conversational filler):\n\nExisting Prompt:\n${prompt}`
    });

    const variedPrompt = variationResponse.text?.trim() || prompt;
    console.log(`Varied prompt output: "${variedPrompt}"`);

    // 2. Feed the varied prompt into Imagen 3
    let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
    if (ratio) {
      if (ratio.includes("1:1")) aspectRatio = "1:1";
      else if (ratio.includes("3:4")) aspectRatio = "3:4";
      else if (ratio.includes("4:3")) aspectRatio = "4:3";
      else if (ratio.includes("9:16")) aspectRatio = "9:16";
      else if (ratio.includes("16:9")) aspectRatio = "16:9";
    }

    console.log(`Sending Varied Prompt to Imagen 3 with Aspect Ratio: ${aspectRatio}`);

    const imagenResponse = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: variedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: aspectRatio,
      },
    });

    if (!imagenResponse?.generatedImages || imagenResponse.generatedImages.length === 0) {
      throw new Error("No variation image was returned by the Imagen API.");
    }

    const base64Bytes = imagenResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64Bytes}`;

    return res.json({ imageUrl, variedPrompt });

  } catch (error: any) {
    console.error("Error generating image variation via server:", error);
    return res.status(500).json({
      error: error?.message || "An unexpected error occurred while generating the image variation.",
    });
  }
});


// Mount Vite middleware for dev or serve static files in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application active at http://localhost:${PORT}`);
  });
}

setupServer();
