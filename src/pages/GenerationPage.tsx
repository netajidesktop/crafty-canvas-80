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

const GenerationPage = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  const handleGenerate = async (config: GenerationConfig) => {
    setIsGenerating(true);
    setImages([]);
    setGenerationProgress(`Generating 0/${config.numberOfImages} images...`);

    const generatePromises = [];

    for (let i = 0; i < config.numberOfImages; i++) {
      const promise = (async () => {
        try {
          const request = {
            background: {
              type: config.environment ? 'predefined' : 'custom',
              value: config.environment || '',
            },
            subjects: {
              type: config.customSubject ? 'custom' : 'predefined',
              data: config.customSubject || config.subjects,
            },
            include: config.include,
            exclude: config.exclude,
          };

          const response = await api.generateImage(request);

          if (response.status === 'success' && response.image) {
            const newImage = {
              id: `${Date.now()}-${i}`,
              data: response.image,
            };
            
            setImages((prev) => [...prev, newImage]);
            setGenerationProgress(
              `Generated ${i + 1}/${config.numberOfImages} images...`
            );
          } else {
            toast.error(response.message || `Failed to generate image ${i + 1}`);
          }
        } catch (error) {
          console.error(`Error generating image ${i + 1}:`, error);
          toast.error(`Failed to generate image ${i + 1}`);
        }
      })();

      generatePromises.push(promise);
    }

    await Promise.all(generatePromises);

    setIsGenerating(false);
    setGenerationProgress('');
    toast.success(`Generated ${config.numberOfImages} image(s)`);
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
              onGenerate={handleGenerate} 
              isGenerating={isGenerating}
              showEnvironment={true}
              showNumberOfImages={false}
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

export default GenerationPage;
