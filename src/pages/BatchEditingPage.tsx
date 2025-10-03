import { useState, useEffect } from 'react';
// UPDATED: Import the new, specific component and its config type
import { BatchEditingConfigurationPane, GenerationConfig } from '@/components/BatchEditingConfigurationPane';
import { OutputPane } from '@/components/GenerationOutputPane';
import { Navigation } from '@/components/Navigation';
import { api, FolderInfo } from '@/lib/api';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  data: string;
}

const BatchEditingPage = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [imageCount, setImageCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await api.getFolders();
        if (response.status === 'success' && response.data) {
          setFolders(response.data);
        } else {
          toast.error('Failed to load folders.');
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to load folders from the server.');
      }
    };
    fetchFolders();
  }, []);

  const handleFolderSelect = (folderName: string) => {
    setSelectedFolder(folderName);
    const folder = folders.find(f => f.name === folderName);
    setImageCount(folder ? folder.image_count : null);
  };

  const handleBatchEdit = async (config: GenerationConfig) => {
    if (!selectedFolder) {
      toast.error('Please select a folder first');
      return;
    }
    if (!imageCount || imageCount === 0) {
      toast.error('The selected folder has no images to edit.');
      return;
    }
    // Your batch editing logic will go here...
    console.log("Starting batch edit with config:", config);
    toast.info(`Starting batch edit for ${imageCount} images in ${selectedFolder}...`);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[550px_1fr] gap-6">
          <div className="bg-card rounded-lg border">
            {/* UPDATED: Use the new BatchEditConfigurationPane component */}
            <BatchEditingConfigurationPane
              onGenerate={handleBatchEdit}
              isGenerating={isGenerating}
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={handleFolderSelect}
              imageCount={imageCount}
            />
          </div>
          <div className="bg-card rounded-lg border">
            <OutputPane
              images={images}
              onRemove={handleRemoveImage}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchEditingPage;