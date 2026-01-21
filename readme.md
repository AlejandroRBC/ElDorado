Existe otro archivo "leeme.md" intenta usar eso primero, ¿no te funciona? entonces recien entra aqui y sigue estos pasos

# Primero, creamos la carpeta raíz y los directorios base para separar las responsabilidades.
mkdir ElDorado
cd ElDorado
npm init -y
mkdir main backend data

# Creacion FrontEnd
Elegir React y JavaScript (o el de tu preferencia)
npm create vite@latest frontend
cd frontend
npm install
cd ..

# Instalación de Dependencias del Sistema (carpeta: ElDorado)
npm install express better-sqlite3
npm install electron
npm install --save-dev concurrently wait-on


# Instalaciones Extras
## Backend
    cd backend
    npm install cors
## Frontend
    cd frontend
    npm install axios
    npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications
