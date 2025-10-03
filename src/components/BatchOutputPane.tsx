import { useState, useEffect } from 'react';
import { ConfigurationPane, GenerationConfig } from '@/components/ConfigurationPane';
import { OutputPane } from '@/components/GenerationOutputPane';
import { Navigation } from '@/components/Navigation';
import { api, FolderInfo } from '@/lib/api'; // Import FolderInfo
import { toast } from 'sonner';

interface GeneratedImage {
    id: string;
    data: string;
}

const BatchEditingPage = () => {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');

    // UPDATED: State now holds the richer FolderInfo object
    const [folders, setFolders] = useState<FolderInfo[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [imageCount, setImageCount] = useState<number | null>(null);

    // REMOVED: The state for 'isFetchingCount' is no longer needed.

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

    // REMOVED: The useEffect for fetching image count is no longer needed.

    // NEW: A single handler to update both the selected folder and the image count
    const handleFolderSelect = (folderName: string) => {
        setSelectedFolder(folderName);
        const folder = folders.find(f => f.name === folderName);
        setImageCount(folder ? folder.image_count : null);
    };

    const handleBatchEdit = async (config: GenerationConfig) => {
        // ... (logic remains the same)
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
                        <ConfigurationPane
                            onGenerate={handleBatchEdit}
                            isGenerating={isGenerating}
                            showEnvironment={false}
                            showNumberOfImages={false}
                            folders={folders}
                            selectedFolder={selectedFolder}
                            // UPDATED: Pass the new handler function
                            onFolderSelect={handleFolderSelect}
                            // Pass the image count directly
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