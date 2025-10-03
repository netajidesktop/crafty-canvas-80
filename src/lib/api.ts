const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// --- INTERFACES ---

export interface Configuration {
  environments: string[];
  subjects: {
    [key: string]: string[];
  };
}

export interface SubjectData {
  category: string;
  values: string[];
}

export interface GenerateRequest {
  background: {
    type: string;
    value: string;
  };
  subjects: {
    type: string;
    data: SubjectData[] | string;
  };
  include: string;
  exclude: string;
}

export interface EditRequest {
  image_b64: string;
  subjects: {
    type: string;
    data: SubjectData[] | string;
  };
  include: string;
  exclude: string;
}

// Interface for the updated folder data from the backend
export interface FolderInfo {
  name: string;
  image_count: number;
}


// --- RESPONSE TYPES ---

// A generic wrapper for standardized API responses
export interface GenericApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Specific response types using the generic wrapper
export type GenerateResponse = GenericApiResponse<{ image: string }>;
export type FolderResponse = GenericApiResponse<FolderInfo[]>;


// --- API CLIENT ---

export const api = {
  /**
   * Fetches the initial configuration for environments and subjects.
   */
  async getConfiguration(): Promise<Configuration> {
    const response = await fetch(`${API_BASE_URL}/list-configuration`);
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    // Assuming the config data is the direct response, not wrapped in the generic response
    return response.json();
  },

  /**
   * Sends a request to generate a new image from scratch.
   */
  async generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to generate image');
    }

    return response.json();
  },

  /**
   * Sends a request to edit an image provided as a Base64 string.
   */
  async editImage(request: EditRequest): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to edit image');
    }

    return response.json();
  },

  /**
   * Fetches the list of folders and the number of images in each.
   */
  async getFolders(): Promise<FolderResponse> {
    const response = await fetch(`${API_BASE_URL}/folders`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch folders');
    }
    return response.json();
  },
};