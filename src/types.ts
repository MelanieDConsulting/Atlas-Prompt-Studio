export interface SubjectState {
  text: string;
  custom: string[];
}

export interface SceneState {
  angle: string;
  distance: string;
  environment: string;
  custom: string[];
  refImages: { name: string; src: string }[];
  activeStyleIdx: number;
  stylePreset: string;
  styleCustom: string[];
  refImageOutput?: { name: string; src: string } | null;
  refImageProduct?: { name: string; src: string } | null;
}

export interface LightingState {
  type: string;
  direction: string;
  extras: string[];
  custom: string[];
}

export interface CameraState {
  body: string;
  lens: string;
  aperture: string;
  shutter: string;
  film: string;
  resolution: string;
  custom: string[];
}

export interface TextureState {
  skin: string[];
  eyes: string[];
  fabric: string[];
  environment: string[];
  custom: string[];
}

export interface MoodState {
  style: string;
  colorGrade: string;
  ratio: string;
  custom: string[];
}

export interface NegativeState {
  presets: string[];
  custom: string[];
}

export interface PromptStudioState {
  subject: SubjectState;
  scene: SceneState;
  lighting: LightingState;
  camera: CameraState;
  texture: TextureState;
  mood: MoodState;
  negative: NegativeState;
}

export interface GeneratedImageRecord {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  ratio: string;
}
