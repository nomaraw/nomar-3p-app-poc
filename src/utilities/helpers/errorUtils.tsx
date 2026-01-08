import axios from 'axios';

export const parseAxiosError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
            case 400:
                return 'Bad Request. Please check your input.';
            case 401:
                return 'Unauthorized. Please log in again.';
            case 403:
                return 'Forbidden. You do not have permission to access this resource.';
            case 404:
                return 'Not Found. The requested resource could not be found.';
            case 500:
                return 'Internal Server Error. Please try again later.';
            case 503:
                return 'Service Unavailable. Please try again later.';
            default:
                return `An error occurred: ${error.message}`;
        }
    }

    return 'An unexpected error occurred.';
}