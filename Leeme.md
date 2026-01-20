# ElDorado - App de Escritorio (React + Express + SQLite + Electron)

Este proyecto es una aplicación de escritorio local que utiliza tecnologías web modernas. La arquitectura separa el frontend, el backend y el proceso de la ventana nativa para mayor escalabilidad.

## Estructura del Proyecto

* **`main/`**: Lógica de Electron (Proceso principal y Preload).
* **`backend/`**: Servidor Express y lógica de base de datos.
* **`frontend/`**: Interfaz de usuario construida con React + Vite.
* **`data/`**: Almacenamiento local de la base de datos SQLite.

---

## Instalación y Uso

Sigue estos pasos para configurar el proyecto localmente:

### 1. Requisitos previos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (se recomienda la versión LTS).

### 2. Clonar e instalar dependencias
Clona el repositorio y ejecuta el siguiente comando en la **raíz del proyecto** para instalar las dependencias de Electron y el Backend:

```bash
npm install