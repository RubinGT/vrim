'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, Star, StarOff, RefreshCw, Link } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CharacterImage {
  id: string;
  name: string;
  filename: string;
  path: string;
  url?: string;
  isDefault: boolean;
  uploadedAt: string;
}

interface CharacterUploadProps {
  onUploadSuccess?: (character: CharacterImage) => void;
  onDefaultChange?: (characterId: string) => void;
}

export function CharacterUpload({ onUploadSuccess, onDefaultChange }: CharacterUploadProps) {
  const [characters, setCharacters] = useState<CharacterImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gallery");
  const [characterName, setCharacterName] = useState("");
  const [characterUrl, setCharacterUrl] = useState("");

  // Fetch existing characters
  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/characters/upload');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Failed to load character images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/characters/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  };

  const addCharacterFromUrl = async () => {
    if (!characterName || !characterUrl) {
      toast.error("Please provide a name and a URL.");
      return;
    }

    try {
      const response = await fetch('/api/characters/add-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: characterName, url: characterUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Character added successfully!");
        setCharacterName("");
        setCharacterUrl("");
        fetchCharacters();
        setActiveTab("gallery");
      } else {
        throw new Error(data.error || 'Failed to add character');
      }
    } catch (error) {
      console.error('Error adding character from URL:', error);
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const setDefaultCharacter = async (characterId: string) => {
    try {
      const response = await fetch('/api/characters/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ characterId }),
      });

      if (response.ok) {
        // Update local state
        setCharacters(prev => 
          prev.map(char => ({
            ...char,
            isDefault: char.id === characterId
          }))
        );
        toast.success('Default character updated');
        onDefaultChange?.(characterId);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default character');
      }
    } catch (error) {
      console.error('Error setting default character:', error);
      toast.error('Failed to set default character');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.webp')) {
          toast.error(`${file.name} is not a WebP file. Only WebP images are allowed.`);
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
          continue;
        }

        try {
          const result = await uploadFile(file);
          toast.success(`${file.name} uploaded successfully!`);
          
          // Add to characters list
          if (result.character) {
            setCharacters(prev => [...prev, result.character]);
            onUploadSuccess?.(result.character);
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } finally {
      setUploading(false);
      fetchCharacters(); // Refresh the gallery
      setActiveTab("gallery"); // Switch to gallery after upload
    }
  }, [onUploadSuccess, fetchCharacters]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/webp': ['.webp']
    },
    multiple: true,
    disabled: uploading
  });

  if (loading && characters.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading character images...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="gallery">Character Gallery</TabsTrigger>
        <TabsTrigger value="upload">Upload New</TabsTrigger>
      </TabsList>
      <TabsContent value="gallery">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Character Images ({characters.length})</CardTitle>
              <CardDescription>
                Click the star to set a character as default. The default character will be used when the app restarts.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCharacters} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="relative group border rounded-lg overflow-hidden bg-card"
                >
                  <div className="aspect-square relative">
                    <img
                      src={character.url || character.path}
                      alt={character.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {character.isDefault && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-50">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate" title={character.name}>
                      {character.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate" title={character.filename}>
                      {character.filename}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(character.uploadedAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefaultCharacter(character.id)}
                        className="h-8 w-8 p-0"
                        title={character.isDefault ? 'Remove as default' : 'Set as default'}
                      >
                        {character.isDefault ? (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {characters.length === 0 && (
              <div className="p-12 text-center">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No character images found</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first WebP character image to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Character Images
            </CardTitle>
            <CardDescription>
              Drag and drop WebP images here, or click to select files. Maximum file size: 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
              `}
            >
              <input {...getInputProps()} />
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg">Drop the WebP files here...</p>
              ) : (
                <div>
                  <p className="text-lg mb-2">
                    {uploading ? 'Uploading...' : 'Drag & drop WebP images here'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to select files
                  </p>
                  <Button variant="outline" disabled={uploading}>
                    Select Files
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Add Character from URL
            </CardTitle>
            <CardDescription>
              Enter the URL of a WebP image and a name for the character.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="character-name">Character Name</Label>
              <Input
                id="character-name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g., Hulk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="character-url">Image URL</Label>
              <Input
                id="character-url"
                value={characterUrl}
                onChange={(e) => setCharacterUrl(e.target.value)}
                placeholder="https://example.com/image.webp"
              />
            </div>
            <Button onClick={addCharacterFromUrl} disabled={!characterName || !characterUrl}>
              Add Character
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}