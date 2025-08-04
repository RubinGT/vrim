import { syncCharacterImages, ensureCharacterDirectories } from './character-images';

/**
 * Initializes the character images system on application startup
 * This ensures directories exist and syncs any existing images
 */
export async function initializeCharacterImages(): Promise<void> {
  try {
    console.log('🎭 Initializing character images system...');
    
    // Ensure directories exist
    await ensureCharacterDirectories();
    console.log('📁 Character directories created/verified');
    
    // Sync existing images
    const config = await syncCharacterImages();
    const characterCount = Object.keys(config.characters).length;
    
    if (characterCount > 0) {
      console.log(`🖼️  Synced ${characterCount} character image(s)`);
      
      if (config.defaultCharacter) {
        const defaultChar = config.characters[config.defaultCharacter];
        console.log(`⭐ Default character: ${defaultChar.name}`);
      }
    } else {
      console.log('📷 No character images found - ready for uploads');
    }
    
    console.log('✅ Character images system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize character images system:', error);
  }
}

/**
 * Runs all startup initialization tasks
 */
export async function runStartupTasks(): Promise<void> {
  console.log('🚀 Running startup tasks...');
  
  await initializeCharacterImages();
  
  console.log('🎉 All startup tasks completed');
}