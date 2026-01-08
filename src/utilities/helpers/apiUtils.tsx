import { apiClient } from './apiClient';
import { parseAxiosError } from './errorUtils';
import { urlEndpoint } from '../constants';

export const fetchDirectoryPersons = async (signal?: AbortSignal) => {
    try {
        const r = await apiClient.get(urlEndpoint.RETRIEVE_PERSONS, { signal });
        
        return r.data;
    } catch (error) {
        return parseAxiosError(error);
    }
}