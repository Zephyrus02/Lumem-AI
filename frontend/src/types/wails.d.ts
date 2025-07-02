interface Model {
  name: string;
  size?: string;
  modified?: string;
}

interface ScanResult {
  models: Model[];
  error?: string;
  success: boolean;
  isLoading?: boolean;
}

interface ModelConfig {
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  num_ctx: number;
  stop: string[];
}

declare global {
  interface Window {
    go: {
      main: {
        App: {
          ScanLocalModels: (provider: string) => Promise<ScanResult>;
          SaveModelConfig: (
            provider: string,
            model: string,
            config: ModelConfig
          ) => Promise<string>;
          ChatWithModel: (
            provider: string,
            model: string,
            message: string
          ) => Promise<string>;
          GetModelConfig: (
            provider: string,
            model: string
          ) => Promise<ModelConfig>;
        };
      };
    };
  }
}

export {};
