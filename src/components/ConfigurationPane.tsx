import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { api, Configuration } from '@/lib/api';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfigurationPaneProps {
  onGenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
  showEnvironment?: boolean;
  showNumberOfImages?: boolean;
  uploadedImage?: string | null;
  onImageUpload?: (image: string) => void;
}

export interface GenerationConfig {
  environment?: string;
  subjects: Array<{ category: string; values: string[] }>;
  customSubject?: string;
  include: string;
  exclude: string;
  numberOfImages: number;
}

export function ConfigurationPane({ 
  onGenerate, 
  isGenerating, 
  showEnvironment = true, 
  showNumberOfImages = true,
  uploadedImage,
  onImageUpload 
}: ConfigurationPaneProps) {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [customEnvironment, setCustomEnvironment] = useState('');
  const [showCustomEnv, setShowCustomEnv] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<{ [key: string]: string[] }>({});
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [includePrompt, setIncludePrompt] = useState('');
  const [excludePrompt, setExcludePrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const data = await api.getConfiguration();
      setConfig(data);
    } catch (error) {
      toast.error('Failed to load configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (category: string, value: string) => {
    setSelectedSubjects((prev) => {
      const current = prev[category] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      if (newValues.length === 0) {
        const { [category]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [category]: newValues };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageUpload?.(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (showEnvironment && !selectedEnvironment && !customEnvironment) {
      toast.error('Please select an environment');
      return;
    }

    const subjectsArray = Object.entries(selectedSubjects).map(([category, values]) => ({
      category,
      values,
    }));

    if (subjectsArray.length === 0 && !customSubject) {
      toast.error('Please select at least one subject or enter a custom subject');
      return;
    }

    onGenerate({
      environment: customEnvironment || selectedEnvironment,
      subjects: subjectsArray,
      customSubject: customSubject || undefined,
      include: includePrompt,
      exclude: excludePrompt,
      numberOfImages,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 overflow-y-auto h-full">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Configuration</h2>

        {onImageUpload && (
          <Card className="p-4 mb-6">
            <Label className="text-sm font-semibold mb-3 block">Upload Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isGenerating}
              className="mb-3"
            />
            {uploadedImage && (
              <div className="mt-3">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded preview" 
                  className="w-full h-auto rounded-md border"
                />
              </div>
            )}
          </Card>
        )}

        {showEnvironment && (
          <Card className="p-4 mb-6">
            <Label className="text-sm font-semibold mb-3 block">Environment</Label>
            <Select 
              value={selectedEnvironment || (showCustomEnv ? 'custom' : '')} 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomEnv(true);
                  setSelectedEnvironment('');
                } else {
                  setSelectedEnvironment(value);
                  setCustomEnvironment('');
                  setShowCustomEnv(false);
                }
              }}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {config?.environments.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env.replace(/-/g, ' ').replace(/\(|\)/g, '')}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Environment</SelectItem>
              </SelectContent>
            </Select>
            {showCustomEnv && (
              <Textarea
                placeholder="Enter custom environment"
                value={customEnvironment}
                onChange={(e) => setCustomEnvironment(e.target.value)}
                disabled={isGenerating}
                className="mt-3"
                rows={3}
              />
            )}
          </Card>
        )}

        <Card className="p-4 mb-6">
          <Label className="text-sm font-semibold mb-3 block">Subjects</Label>
          {config?.subjects && Object.entries(config.subjects).map(([category, values]) => (
            <div key={category} className="mb-4">
              <Label className="text-xs text-muted-foreground mb-2 block capitalize">
                {category.replace(/_/g, ' ')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {values.map((value) => (
                  <Button
                    key={value}
                    variant={selectedSubjects[category]?.includes(value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSubject(category, value)}
                    disabled={isGenerating}
                    className="justify-start text-xs"
                  >
                    {value.replace(/-/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <Button
            variant={showCustomSubject ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCustomSubject(!showCustomSubject)}
            disabled={isGenerating}
            className="w-full mt-2"
          >
            Custom Subject
          </Button>
          {showCustomSubject && (
            <Textarea
              placeholder="Enter custom subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              disabled={isGenerating}
              className="mt-3"
              rows={3}
            />
          )}
        </Card>

        <Card className="p-4 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="include" className="text-sm font-semibold mb-2 block">
                Include
              </Label>
              <Input
                id="include"
                placeholder="Additional elements to include..."
                value={includePrompt}
                onChange={(e) => setIncludePrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div>
              <Label htmlFor="exclude" className="text-sm font-semibold mb-2 block">
                Exclude
              </Label>
              <Input
                id="exclude"
                placeholder="Elements to exclude..."
                value={excludePrompt}
                onChange={(e) => setExcludePrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6">
          {showNumberOfImages && (
            <>
              <Label htmlFor="numImages" className="text-sm font-semibold mb-2 block">
                Number of Images (1-6)
              </Label>
              <div className="flex gap-3 mb-3">
                <Input
                  id="numImages"
                  type="number"
                  min="1"
                  max="6"
                  value={numberOfImages}
                  onChange={(e) => setNumberOfImages(Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))}
                  disabled={isGenerating}
                  className="flex-1"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
            </>
          )}
          {!showNumberOfImages && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Editing...
                </>
              ) : (
                'Edit Image'
              )}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
