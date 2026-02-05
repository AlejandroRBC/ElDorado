
import api from '../../../api/axiosConfig';

export const fileUploadService = {
    // Método para subir imagen de perfil
    uploadProfileImage: async (file, ci) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('ci', ci);
        
        try {
            const response = await api.post('/upload/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return {
                success: true,
                url: response.data.url,
                filename: response.data.filename
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                error: 'Error al subir la imagen'
            };
        }
    },

    // Método para eliminar imagen
    deleteProfileImage: async (filename) => {
        try {
            await api.delete(`/upload/profile/${filename}`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting image:', error);
            return { success: false };
        }
    }
};