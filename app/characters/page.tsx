import { CharacterUpload } from '@/components/character-upload';
import { runStartupTasks } from '@/lib/startup';

export default async function CharactersPage() {
  // Run startup tasks to ensure character system is initialized
  await runStartupTasks();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Character Images</h1>
          <p className="text-muted-foreground">
            Upload and manage your WebP character images. Set a default character that will persist after restart.
          </p>
        </div>
        
        <CharacterUpload />
      </div>
    </div>
  );
}