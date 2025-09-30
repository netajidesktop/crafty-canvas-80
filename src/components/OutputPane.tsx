import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Loader2 } from 'lucide-react';
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

      <div className="flex-1 overflow-y-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative group">
                <img
                  src={`data:image/png;base64,${image.data.replace(/^data:image\/\w+;base64,/, '')}`}
                  alt="Generated"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
