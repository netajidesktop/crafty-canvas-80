import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { api, Configuration, FolderInfo } from '@/lib/api';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BatchEditingConfigurationPaneProps {
    onGenerate: (config: GenerationConfig) => void;
    isGenerating: boolean;
    folders: FolderInfo[];
    selectedFolder: string;
    onFolderSelect: (folder: string) => void;
    imageCount: number | null;
}

export interface GenerationConfig {
    subjects: Array<{ category: string; values: string[] }>;
    customSubject?: string;
    include: string;
    exclude: string;
    numberOfImages: number;
}

export function BatchEditingConfigurationPane({
    onGenerate,
    isGenerating,
    folders,
    selectedFolder,
    onFolderSelect,
    imageCount,
}: BatchEditingConfigurationPaneProps) {
    const [config, setConfig] = useState<Configuration | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubjects, setSelectedSubjects] = useState<{ [key: string]: string[] }>({});
    const [customSubject, setCustomSubject] = useState('');
    const [showCustomSubject, setShowCustomSubject] = useState(false);
    const [includePrompt, setIncludePrompt] = useState('');
    const [excludePrompt, setExcludePrompt] = useState('');

    useEffect(() => {
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
        loadConfiguration();
    }, []);

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
        const subjectsArray = Object.entries(selectedSubjects).map(([category, values]) => ({
            category,
            values,
        }));

        if (subjectsArray.length === 0 && !customSubject) {
            toast.error('Please select at least one subject or enter a custom subject');
            return;
        }

        onGenerate({
            subjects: subjectsArray,
            customSubject: customSubject || undefined,
            include: includePrompt,
            exclude: excludePrompt,
            numberOfImages: imageCount || 0,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Configuration</h2>

            <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">Source Folder</Label>
                <Select value={selectedFolder} onValueChange={onFolderSelect} disabled={isGenerating}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a folder to edit" />
                    </SelectTrigger>
                    <SelectContent>
                        {folders.map((folder) => (
                            <SelectItem key={folder.name} value={folder.name}>
                                {folder.name} ({folder.image_count} images)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* The redundant count display has been removed from here */}
            </div>

            <div className="mb-6">
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
                                    className="justify-start text-xs whitespace-normal h-auto py-2"
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
            </div>

            <div className="mb-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="include" className="text-sm font-semibold mb-2 block">
                            Include
                        </Label>
                        <Textarea
                            id="include"
                            placeholder="Additional elements to include..."
                            value={includePrompt}
                            onChange={(e) => setIncludePrompt(e.target.value)}
                            disabled={isGenerating}
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="exclude" className="text-sm font-semibold mb-2 block">
                            Exclude
                        </Label>
                        <Textarea
                            id="exclude"
                            placeholder="Elements to exclude..."
                            value={excludePrompt}
                            onChange={(e) => setExcludePrompt(e.target.value)}
                            disabled={isGenerating}
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
                    {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Editing...</> : 'Edit All Images'}
                </Button>
            </div>
        </div>
    );
}