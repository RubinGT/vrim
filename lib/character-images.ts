import { promises as fs } from 'fs';
import path from 'path';

export interface CharacterImage {
  id: string;
  name: string;
  filename: string;
  path: string;
  url?: string; // Add optional url field
  isDefault: boolean;
  uploadedAt: Date;
}

export interface CharacterConfig {
  defaultCharacter?: string;
  characters: Record<string, CharacterImage>;
}

const CHARACTERS_DIR = path.join(process.cwd(), 'public', 'characters');
const IMAGES_DIR = path.join(CHARACTERS_DIR, 'images');
const DEFAULTS_DIR = path.join(CHARACTERS_DIR, 'defaults');
const CONFIG_FILE = path.join(DEFAULTS_DIR, 'characters.json');

/**
 * Ensures the character directories exist
 */
export async function ensureCharacterDirectories(): Promise<void> {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.mkdir(DEFAULTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating character directories:', error);
  }
}

/**
 * Loads the character configuration from the defaults file
 */
export async function loadCharacterConfig(): Promise<CharacterConfig> {
  try {
    await ensureCharacterDirectories();
    
    const configExists = await fs.access(CONFIG_FILE).then(() => true).catch(() => false);
    
    if (!configExists) {
      const defaultConfig: CharacterConfig = {
        characters: {}
      };
      await saveCharacterConfig(defaultConfig);
      return defaultConfig;
    }
    
    const configData = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading character config:', error);
    return { characters: {} };
  }
}

/**
 * Saves the character configuration to the defaults file
 */
export async function saveCharacterConfig(config: CharacterConfig): Promise<void> {
  try {
    await ensureCharacterDirectories();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving character config:', error);
  }
}

/**
 * Adds a new character from a URL
 */
export async function addCharacterFromUrl(name: string, url: string): Promise<CharacterImage | null> {
  try {
    const config = await loadCharacterConfig();
    const id = name.toLowerCase().replace(/\s+/g, '-');

    if (config.characters[id]) {
      // Character already exists
      return null;
    }

    const newCharacter: CharacterImage = {
      id,
      name,
      filename: 'N/A',
      path: url,
      url,
      isDefault: false,
      uploadedAt: new Date(),
    };

    config.characters[id] = newCharacter;
    await saveCharacterConfig(config);

    return newCharacter;
  } catch (error) {
    console.error('Error adding character from URL:', error);
    return null;
  }
}

/**
 * Scans the images directory and syncs with the configuration
 */
export async function syncCharacterImages(): Promise<CharacterConfig> {
  try {
    await ensureCharacterDirectories();
    
    const config = await loadCharacterConfig();
    const imageFiles = await fs.readdir(IMAGES_DIR);
    
    // Filter for WebP files
    const webpFiles = imageFiles.filter(file => 
      file.toLowerCase().endsWith('.webp')
    );
    
    // Add new images to config
    for (const filename of webpFiles) {
      const id = filename.replace('.webp', '');
      const imagePath = `/characters/images/${filename}`;
      
      if (!config.characters[id]) {
        config.characters[id] = {
          id,
          name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          filename,
          path: imagePath,
          isDefault: false,
          uploadedAt: new Date()
        };
      }
    }
    
    // Remove deleted images from config
    const existingIds = Object.keys(config.characters);
    for (const id of existingIds) {
      const character = config.characters[id];
      if (!character.url) { // Only check for local files
        const fileExists = webpFiles.includes(character.filename);
        
        if (!fileExists) {
          delete config.characters[id];
          // If this was the default character, clear it
          if (config.defaultCharacter === id) {
            config.defaultCharacter = undefined;
          }
        }
      }
    }
    
    // Set first character as default if no default is set
    const characterIds = Object.keys(config.characters);
    if (characterIds.length > 0 && !config.defaultCharacter) {
      config.defaultCharacter = characterIds[0];
      config.characters[characterIds[0]].isDefault = true;
    }
    
    await saveCharacterConfig(config);
    return config;
  } catch (error) {
    console.error('Error syncing character images:', error);
    return { characters: {} };
  }
}

/**
 * Gets all available character images
 */
export async function getCharacterImages(): Promise<CharacterImage[]> {
  const config = await syncCharacterImages();
  return Object.values(config.characters);
}

/**
 * Gets the default character image
 */
export async function getDefaultCharacter(): Promise<CharacterImage | null> {
  const config = await loadCharacterConfig();
  
  if (config.defaultCharacter && config.characters[config.defaultCharacter]) {
    return config.characters[config.defaultCharacter];
  }
  
  // Return first available character if no default is set
  const characters = Object.values(config.characters);
  return characters.length > 0 ? characters[0] : null;
}

/**
 * Sets a character as the default
 */
export async function setDefaultCharacter(characterId: string): Promise<boolean> {
  try {
    const config = await loadCharacterConfig();
    
    if (!config.characters[characterId]) {
      return false;
    }
    
    // Remove default flag from all characters
    Object.values(config.characters).forEach(char => {
      char.isDefault = false;
    });
    
    // Set new default
    config.defaultCharacter = characterId;
    config.characters[characterId].isDefault = true;
    
    await saveCharacterConfig(config);
    return true;
  } catch (error) {
    console.error('Error setting default character:', error);
    return false;
  }
}

/**
 * Validates if a file is a valid WebP image
 */
export function isValidWebPFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.webp');
}

/**
 * Gets the character image URL for use in the frontend
 */
export function getCharacterImageUrl(character: CharacterImage): string {
  return character.url || character.path;
}