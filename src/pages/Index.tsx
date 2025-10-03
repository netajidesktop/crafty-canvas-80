import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigurationPane, GenerationConfig } from '@/components/ConfigurationPane';
import { OutputPane } from '@/components/OutputPane';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  data: string;
}

const Index = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleGenerate = async (config: GenerationConfig) => {
    setIsGenerating(true);
    setImages([]); // Clear existing images
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

  const handleBatchEdit = async (config: GenerationConfig) => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    setImages([]);
    setGenerationProgress(`Generating 0/${config.numberOfImages} images...`);

    const generatePromises = [];

    for (let i = 0; i < config.numberOfImages; i++) {
      const promise = (async () => {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="px-4 py-4">
          <h1 className="text-3xl font-bold text-foreground">Image Generation Studio</h1>
        </div>
      </header>

      <main className="p-4">
        <Tabs defaultValue="generation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="generation" className="text-base font-bold">Generation</TabsTrigger>
            <TabsTrigger value="batch" className="text-base font-bold">
              Batch Editing
            </TabsTrigger>
            <TabsTrigger value="editing" className="text-base font-bold">
              Editing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generation" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-[550px_1fr] gap-6 h-[calc(100vh-220px)]">
              <div className="bg-card rounded-lg border overflow-hidden">
          <ConfigurationPane 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating}
            showEnvironment={true}
            showNumberOfImages={false}
          />
              </div>

              <div className="bg-card rounded-lg border overflow-hidden">
                <OutputPane
                  images={images}
                  onRemove={handleRemoveImage}
                  isGenerating={isGenerating}
                  generationProgress={generationProgress}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="grid grid-cols-1 lg:grid-cols-[550px_1fr] gap-6 h-[calc(100vh-220px)]">
              <div className="bg-card rounded-lg border overflow-hidden">
          <ConfigurationPane 
            onGenerate={handleBatchEdit} 
            isGenerating={isGenerating}
            showEnvironment={false}
            showNumberOfImages={false}
          />
              </div>

              <div className="bg-card rounded-lg border overflow-hidden">
                <OutputPane
                  images={images}
                  onRemove={handleRemoveImage}
                  isGenerating={isGenerating}
                  generationProgress={generationProgress}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editing">
            <div className="grid grid-cols-1 lg:grid-cols-[550px_1fr] gap-6 h-[calc(100vh-220px)]">
              <div className="bg-card rounded-lg border overflow-hidden">
                <ConfigurationPane
                  onGenerate={handleEdit}
                  isGenerating={isGenerating}
                  showEnvironment={false}
                  showNumberOfImages={false}
                  uploadedImage={uploadedImage}
                  onImageUpload={setUploadedImage}
                />
              </div>

              <div className="bg-card rounded-lg border overflow-hidden">
                <OutputPane
                  images={images}
                  onRemove={handleRemoveImage}
                  isGenerating={isGenerating}
                  generationProgress={generationProgress}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
