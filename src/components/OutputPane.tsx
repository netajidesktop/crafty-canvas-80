import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Download, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface GeneratedImage {
  id: string;
  data: string;
}

interface OutputPaneProps {
  images: GeneratedImage[];
  onRemove: (id: string) => void;
  isGenerating: boolean;
  generationProgress?: string;
}

export function OutputPane({ images, onRemove, isGenerating, generationProgress }: OutputPaneProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const openPreview = (imageUrl: string, index: number) => {
    setPreviewImage(imageUrl);
    setPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleNext = () => {
    const nextIndex = (previewIndex + 1) % images.length;
    setPreviewIndex(nextIndex);
    const nextImageUrl = `data:image/png;base64,${images[nextIndex].data.replace(/^data:image\/\w+;base64,/, '')}`;
    setPreviewImage(nextImageUrl);
  };

  const handlePrevious = () => {
    const prevIndex = previewIndex === 0 ? images.length - 1 : previewIndex - 1;
    setPreviewIndex(prevIndex);
    const prevImageUrl = `data:image/png;base64,${images[prevIndex].data.replace(/^data:image\/\w+;base64,/, '')}`;
    setPreviewImage(prevImageUrl);
  };

  const handleRemoveFromPreview = () => {
    const imageToRemove = images[previewIndex];
    onRemove(imageToRemove.id);
    closePreview();
  };

  const handleDownloadZip = async () => {
    if (images.length === 0) {
      toast.error('No images to download');
      return;
    }

    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

      images.forEach((img, index) => {
        const base64Data = img.data.split(',')[1] || img.data;
        zip.file(`image-${index + 1}.png`, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-images-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Images downloaded successfully');
    } catch (error) {
      toast.error('Failed to download images');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Output</h2>
        {images.length > 0 && (
          <Button onClick={handleDownloadZip} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Save as ZIP
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {isGenerating && (
          <Card className="p-6 mb-4 bg-muted/50">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
              <span className="text-sm text-muted-foreground">
                {generationProgress || 'Generating images...'}
              </span>
            </div>
          </Card>
        )}

        {images.length === 0 && !isGenerating && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Generated images will appear here
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 h-full content-start">
          {images.map((image, index) => {
            const imageUrl = `data:image/png;base64,${image.data.replace(/^data:image\/\w+;base64,/, '')}`;
            return (
              <div key={image.id} className="flex flex-col">
                <div className="relative rounded-lg overflow-hidden border bg-muted cursor-pointer" style={{ aspectRatio: '1/1' }}>
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full h-full object-cover"
                    onClick={() => openPreview(imageUrl, index)}
                  />
                </div>
                <div className="p-2 flex justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(image.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={!!previewImage} onOpenChange={closePreview}>
          <DialogContent className="max-w-4xl w-full p-0">
            {previewImage && (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-auto"
                />
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handlePrevious}
                    className="rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleNext}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveFromPreview}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
