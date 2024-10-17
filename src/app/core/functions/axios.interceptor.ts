import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthService } from '../services/auth.service';

export class AxiosInterceptor {
  protected apiClient: AxiosInstance;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
    this.apiClient = axios.create({
      baseURL: 'http://localhost:3000/api',
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor() {
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token: string | null = this.authService.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private initializeResponseInterceptor() {
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Se il token è scaduto (status 401), prova a chiederlo di nuovo
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true; // Imposta un flag per evitare loop infiniti

          try {
            const responseToken: AxiosResponse<any, any> = await this.authService.refreshToken();
            const { accessToken } = responseToken.data;
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

            // Riprova la richiesta originale
            return this.apiClient(originalRequest);
          } catch (refreshError) {
            console.error('Errore durante il refresh del token:', refreshError);
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getApiClient(): AxiosInstance {
    return this.apiClient;
  }
}
