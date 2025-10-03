// src/components/OutputPane.tsx

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// CHANGED: Interface for a single image
interface GeneratedImage {
    id: string;
    data: string;
}

// CHANGED: Props are updated for a single image
interface OutputPaneProps {
    image: GeneratedImage | null;
    onRemove: () => void;
    isGenerating: boolean;
    generationProgress?: string;
}

export function EditingOutputPane({ image, onRemove, isGenerating, generationProgress }: OutputPaneProps) {

    // NEW: Simple download handler for a single image
    const handleDownload = () => {
        if (!image) {
            toast.error('No image to download');
            return;
        }
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${image.data}`;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded');
    };

    return (
        // Use flex column to structure the pane
        <div className="flex flex-col p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Output</h2>
                {/* Actions are only visible when there is an image */}
                {image && !isGenerating && (
                    <div className="flex items-center gap-2">
                        <Button onClick={handleDownload} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </div>
                )}
            </div>

            {/* Main content area */}
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted/30 rounded-lg">
                {isGenerating && (
                    <Card className="p-6 bg-muted/50">
                        <div className="flex items-start justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                            <span className="text-sm text-muted-foreground">
                                {generationProgress || 'Editing image...'}
                            </span>
                        </div>
                    </Card>
                )}

                {!image && !isGenerating && (
                    <div className="flex items-start justify-center h-full">
                        <p className="text-muted-foreground text-center">
                            The edited image will appear here
                        </p>
                    </div>
                )}

                {/* This is the container for the single, large image */}
                {image && !isGenerating && (
                    <div className="w-full h-full p-4 flex items-start justify-center">
                        <img
                            src={`data:image/png;base64,${image.data}`}
                            alt="Generated Output"
                            // These classes ensure the image fits within the container without being distorted
                            className="max-w-full max-h-full object-contain rounded-md"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}