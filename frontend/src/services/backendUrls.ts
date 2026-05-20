const backendUrl = import.meta.env.VITE_BACKEND_SERVER;


export const getBackendUrl = (): string => {
    return backendUrl;
};