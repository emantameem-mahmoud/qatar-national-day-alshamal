export enum AppStep {
  WELCOME = 'WELCOME',
  CAPTURE = 'CAPTURE',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  imageUrl: string;
}

export interface CreditsProps {
  minimal?: boolean;
}