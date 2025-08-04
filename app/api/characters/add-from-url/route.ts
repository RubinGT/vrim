import { NextRequest, NextResponse } from 'next/server';
import { addCharacterFromUrl } from '@/lib/character-images';

export async function POST(request: NextRequest) {
  try {
    const { name, url } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const newCharacter = await addCharacterFromUrl(name, url);

    if (!newCharacter) {
      return NextResponse.json(
        { error: 'Character already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Character added successfully',
      character: newCharacter,
    });
  } catch (error) {
    console.error('Error adding character from URL:', error);
    return NextResponse.json(
      { error: 'Failed to add character from URL' },
      { status: 500 }
    );
  }
}
