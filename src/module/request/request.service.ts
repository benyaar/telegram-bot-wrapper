/**
 * Service for making requests using axios
 *
 * GET  
 * @param {string} url - resource path
 * @param {AxiosRequestConfig} config - request configuration
 * @return {T} - returns data from the resource
 * POST
 * @param {string} url - resource path
 * @param {any} data - data to send
 * @param {AxiosRequestConfig} config - request configuration
 * PUT 
 * @param {string} url - resource path
 * @param {any} data - data to send
 * @param {AxiosRequestConfig} config - request configuration
 * DELETE 
 * @param {string} url - resource path
 * @param {AxiosRequestConfig} config - request configuration
 */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class RequestService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        throw new HttpException(
          error.response?.data || 'Something error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }
}
