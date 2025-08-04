import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { syncCharacterImages, isValidWebPFile, ensureCharacterDirectories } from '@/lib/character-images';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'characters', 'images');

export async function POST(request: NextRequest) {
  try {
    await ensureCharacterDirectories();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!isValidWebPFile(file.name)) {
      return NextResponse.json(
        { error: 'Only WebP files are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Create a safe filename
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filePath = path.join(IMAGES_DIR, sanitizedName);
    
    // Check if file already exists
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (fileExists) {
      return NextResponse.json(
        { error: 'A character image with this name already exists' },
        { status: 409 }
      );
    }
    
    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);
    
    // Sync character images to update the configuration
    const config = await syncCharacterImages();
    
    // Get the uploaded character info
    const characterId = sanitizedName.replace('.webp', '');
    const uploadedCharacter = config.characters[characterId];
    
    return NextResponse.json({
      success: true,
      message: 'Character image uploaded successfully',
      character: uploadedCharacter,
      isDefault: uploadedCharacter?.isDefault || false
    });
    
  } catch (error) {
    console.error('Error uploading character image:', error);
    return NextResponse.json(
      { error: 'Failed to upload character image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const config = await syncCharacterImages();
    
    return NextResponse.json({
      characters: Object.values(config.characters),
      defaultCharacter: config.defaultCharacter
    });
    
  } catch (error) {
    console.error('Error fetching character images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character images' },
      { status: 500 }
    );
  }
}