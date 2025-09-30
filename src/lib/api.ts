const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

export interface GenerateResponse {
  status: 'success' | 'error';
  image?: string;
  message?: string;
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

export const api = {
  async getConfiguration(): Promise<Configuration> {
    const response = await fetch(`${API_BASE_URL}/list-configuration`);
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    return response.json();
  },

  async generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    return response.json();
  },

  async editImage(request: EditRequest): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE_URL}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to edit image');
    }
    
    return response.json();
  },
};
