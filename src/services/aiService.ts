import axiosInstance from './axiosInstance';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ChatRequest {
  message: string;
  includeUserBeverages?: boolean;
}

export interface ChatResponse {
  message: string;
  role: string;
  timestamp: string;
  contextIncluded: boolean;
}

export async function sendChatMessage(
  message: string,
  includeContext: boolean = true
): Promise<ChatResponse> {
  const request: ChatRequest = {
    message,
    includeUserBeverages: includeContext,
  };

  try {
    const response = await axiosInstance.post<ChatResponse>(
      `${API_BASE_URL}/api/v1/ai/chat`,
      request
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('AI API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });

      if (error.response?.status === 403) {
        throw new Error('Access denied. Your session may have expired. Please log in again.');
      }

      throw new Error(error.response?.data?.message || 'Failed to get AI response');
    }
    throw error;
  }
}
