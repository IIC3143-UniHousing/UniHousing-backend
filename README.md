# UniHousing-backend

## Descripción
Backend para la aplicación UniHousing, una plataforma que facilita la búsqueda y gestión de alojamiento para estudiantes universitarios.

## Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL
- npm

## Configuración del Entorno

1. Clonar el repositorio:
```bash
git clone https://github.com/IIC3143-UniHousing/UniHousing-backend.git
cd UniHousing-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env` con las siguientes variables:
```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/unihousing_dev?schema=public"
```

4. Configurar la base de datos:
```bash
npx prisma migrate dev
```

## Desarrollo

1. Iniciar servidor en modo desarrollo:
```bash
npm run dev
```

2. Ejecutar pruebas:
```bash
npm test
```

## API Endpoints

Documentados con Swagger en `/docs`.
