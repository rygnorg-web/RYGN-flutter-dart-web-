export type DeviceType = 'iphone' | 'pixel' | 'tablet' | 'web';
export type DeviceOrientation = 'portrait' | 'landscape';
export type FlutterThemeMode = 'dark' | 'light';

export interface FlutterSnippet {
  id: string;
  title: string;
  category: 'state_management' | 'ui_widgets' | 'routing' | 'animation' | 'networking' | 'dart_3';
  description: string;
  tags: string[];
  code: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export interface FlutterProjectFile {
  name: string;
  path: string;
  content: string;
  language: 'dart' | 'yaml' | 'json';
}
