import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { api, Configuration } from '@/lib/api';
import { toast } from 'sonner';

interface ConfigurationPaneProps {
  onGenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
  showEnvironment?: boolean;
}

export interface GenerationConfig {
  environment?: string;
  subjects: Array<{ category: string; values: string[] }>;
  customSubject?: string;
  include: string;
  exclude: string;
  numberOfImages: number;
}

export function ConfigurationPane({ onGenerate, isGenerating, showEnvironment = true }: ConfigurationPaneProps) {
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

        {showEnvironment && (
          <Card className="p-4 mb-6">
            <Label className="text-sm font-semibold mb-3 block">Environment</Label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {config?.environments.map((env) => (
                <Button
                  key={env}
                  variant={selectedEnvironment === env ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedEnvironment(env);
                    setCustomEnvironment('');
                    setShowCustomEnv(false);
                  }}
                  disabled={isGenerating}
                  className="justify-start text-xs"
                >
                  {env.replace(/-/g, ' ').replace(/\(|\)/g, '')}
                </Button>
              ))}
            </div>
            <Button
              variant={showCustomEnv ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setShowCustomEnv(!showCustomEnv);
                if (!showCustomEnv) {
                  setSelectedEnvironment('');
                }
              }}
              disabled={isGenerating}
              className="w-full"
            >
              Custom Environment
            </Button>
            {showCustomEnv && (
              <Input
                placeholder="Enter custom environment"
                value={customEnvironment}
                onChange={(e) => setCustomEnvironment(e.target.value)}
                disabled={isGenerating}
                className="mt-2"
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
            <Input
              placeholder="Enter custom subject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              disabled={isGenerating}
              className="mt-2"
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
          <Label htmlFor="numImages" className="text-sm font-semibold mb-2 block">
            Number of Images (1-30)
          </Label>
          <Input
            id="numImages"
            type="number"
            min="1"
            max="30"
            value={numberOfImages}
            onChange={(e) => setNumberOfImages(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={isGenerating}
          />
        </Card>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
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
    </div>
  );
}
