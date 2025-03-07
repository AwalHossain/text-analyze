/* eslint-disable @typescript-eslint/no-explicit-any */



import api from '@/utils/axios';

interface AnalysisResponse {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  longestWord: string;
}

interface AnalysisRequest {
  content: string;
  type?: 'words' | 'characters' | 'sentences' | 'paragraphs' | 'longestWord' | 'text';
}

class TextAnalysisService {
  private static instance: TextAnalysisService;
  private constructor() {}

  public static getInstance(): TextAnalysisService {
    if (!TextAnalysisService.instance) {
      TextAnalysisService.instance = new TextAnalysisService();
    }
    return TextAnalysisService.instance;
  }
  async analyzeText({ content }: AnalysisRequest) {
    const response = await api.post(`/analyze/text`, {
      content,
    });
    return response.data;
  }

  async analyzeSpecific({ content, type }: Required<AnalysisRequest>) {
      const response = await api.post(`/analyze/${type}`, {
        content,
      });
      return response.data;
    } catch (error: any) {
      // console.log(error.response,"error from the front", error);
      throw error;
    }

    async getAllAnalyses() {
      try {
        const response = await api.get('/analyze/all');
        return response.data;
      } catch (error: any) {
        console.log(error.response,"error", error);
        throw error;
      }
    }
  }



export const textAnalysisService = TextAnalysisService.getInstance();
