
export const saveImageLocally = (file, fileName) => {
    return new Promise((resolve, reject) => {
        // Esta función solo funciona en desarrollo y con ciertas configuraciones
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                // En desarrollo, esto no guardará realmente en el sistema de archivos
                // pero puedes simularlo
                const img = new Image();
                img.src = event.target.result;
                
                // Guardar en localStorage como simulación
                localStorage.setItem(`profile_${fileName}`, event.target.result);
                
                resolve({
                    success: true,
                    url: `/assets/perfiles/${fileName}`
                });
            } catch (err) {
                reject(err);
            }
        };
        
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};