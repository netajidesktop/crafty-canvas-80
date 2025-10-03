import { useState } from 'react';
import { ConfigurationPane, GenerationConfig } from '@/components/ConfigurationPane';
import { OutputPane } from '@/components/OutputPane';
import { Navigation } from '@/components/Navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  data: string;
}

const EditingPage = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleEdit = async (config: GenerationConfig) => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setImages([]);

    try {
      const request = {
        image_b64: uploadedImage,
        subjects: {
          type: config.customSubject ? 'custom' : 'predefined',
          data: config.customSubject || config.subjects,
        },
        include: config.include,
        exclude: config.exclude,
      };

      const response = await api.editImage(request);

      if (response.status === 'success' && response.image) {
        const newImage = {
          id: `${Date.now()}`,
          data: response.image,
        };
        
        setImages([newImage]);
        toast.success('Image edited successfully');
      } else {
        toast.error(response.message || 'Failed to edit image');
      }
    } catch (error) {
      console.error('Error editing image:', error);
      toast.error('Failed to edit image');
    } finally {
      setIsGenerating(false);
    }
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
              onGenerate={handleEdit}
              isGenerating={isGenerating}
              showEnvironment={false}
              showNumberOfImages={false}
              uploadedImage={uploadedImage}
              onImageUpload={setUploadedImage}
            />
          </div>

          <div className="bg-card rounded-lg border">
            <OutputPane
              images={images}
              onRemove={handleRemoveImage}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditingPage;
