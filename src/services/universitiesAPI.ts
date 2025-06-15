import axios from 'axios';

import { API_URL } from '@app/constants';
/**
 * Interface for parameters when getting multiple universities (e.g., for pagination, filtering).
 * This is a placeholder; adjust properties as needed for your specific university API.
 */
export interface GetUniversitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  // Add any other specific query parameters for filtering universities
}
/**
 * Interface for the detailed structure of a single university.
 * Adjust properties to match your actual university data model.
 */
export interface UniversityDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  // Add other relevant university properties like:
  // coursesOffered: string[];
  // website: string;
  // contactEmail: string;
  // establishedYear: number;
}
/**
 * Fetches a list of universities from the API.
 * @param params - Optional parameters for filtering or pagination.
 * @returns A Promise that resolves to the API response containing a list of universities.
 */
export const getUniversitiesAPI = async (params?: GetUniversitiesParams) =>
  await axios.get(API_URL.UNIVERSITIES, { params });
/**
 * Fetches a single university by its ID.
 * @param id - The ID of the university to fetch.
 * @returns A Promise that resolves to the API response containing the university details.
 */
export const getUniversityByIdAPI = async (id: number) =>
  await axios.get<UniversityDetail>(`${API_URL.UNIVERSITIES}/${id}`);
/**
 * Updates an existing university.
 * @param university - The university object with updated details. It must contain the 'id'.
 * @returns A Promise that resolves when the update is successful.
 */
export const updateUniversity = async (university: UniversityDetail) =>
  await axios.patch<void>(`${API_URL.UNIVERSITIES}/${university.id}`, university);
/**
 * Deletes a university by its ID.
 * @param id - The ID of the university to delete.
 * @returns A Promise that resolves when the deletion is successful.
 */
export const deleteUniversityAPI = async (id: number) =>
  await axios.delete<void>(`${API_URL.UNIVERSITIES}/${id}`);
/**
 * Creates a new university.
 * Assumes the university creation might also involve FormData, similar to user creation.
 * If your university creation uses a simple JSON body, you can adjust the `formData` parameter
 * to `university: Omit<UniversityDetail, 'id'>` and remove the FormData and headers part.
 * @param formData - FormData containing the university data to be created.
 * @returns A Promise that resolves to the API response after the university is created.
 */
export const createUniversity = async (formData: FormData) =>
  await axios.post<UniversityDetail>(API_URL.UNIVERSITIES, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
