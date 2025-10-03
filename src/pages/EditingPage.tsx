import { useState } from 'react';
import { EditingConfigurationPane, GenerationConfig } from '@/components/EditingConfigurationPane';
import { EditingOutputPane } from '@/components/EditingOutputPane';
import { Navigation } from '@/components/Navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  data: string;
}

const EditingPage = () => {
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleEdit = async (config: GenerationConfig) => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setImage(null);

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

        setImage(newImage);
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

  const handleRemoveImage = () => {
    setImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[550px_1fr] gap-6">
          <div className="bg-card rounded-lg border">
            {/* UPDATED: Use the new EditConfigurationPane component */}
            <EditingConfigurationPane
              onGenerate={handleEdit}
              isGenerating={isGenerating}
              uploadedImage={uploadedImage}
              onImageUpload={setUploadedImage}
            />
          </div>
          {/* <div className="bg-card rounded-lg border"> */}
          <EditingOutputPane
            image={image}
            onRemove={handleRemoveImage}
            isGenerating={isGenerating}
          />
          {/* </div> */}
        </div>
      </main>
    </div>
  );
};

export default EditingPage;