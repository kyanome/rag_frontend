import { AxiosError } from 'axios';

export interface APIErrorResponse {
  detail: string;
  code?: string;
}

export type APIError = AxiosError<APIErrorResponse>;