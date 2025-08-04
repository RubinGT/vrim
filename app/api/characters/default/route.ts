import { NextRequest, NextResponse } from 'next/server';
import { setDefaultCharacter, getDefaultCharacter, syncCharacterImages } from '@/lib/character-images';

export async function POST(request: NextRequest) {
  try {
    await syncCharacterImages();
    const { characterId } = await request.json();
    
    if (!characterId) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      );
    }
    
    const success = await setDefaultCharacter(characterId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Default character updated successfully',
      defaultCharacter: characterId
    });
    
  } catch (error) {
    console.error('Error setting default character:', error);
    return NextResponse.json(
      { error: 'Failed to set default character' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await syncCharacterImages();
    const defaultCharacter = await getDefaultCharacter();
    
    return NextResponse.json({
      defaultCharacter
    });
    
  } catch (error) {
    console.error('Error getting default character:', error);
    return NextResponse.json(
      { error: 'Failed to get default character' },
      { status: 500 }
    );
  }
}