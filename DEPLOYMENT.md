# Despliegue del proyecto

Este proyecto tiene dos partes principales:

- `apps/web` → frontend Next.js
- `apps/api` → backend NestJS
- `supabase/` → migraciones de la base de datos

## Recomendación de hosting gratuito

- Frontend: Vercel
- Backend: Railway o Render
- Base de datos: Supabase Cloud

## 1. Subir el repositorio a GitHub

Primero necesitas un repositorio en GitHub con este proyecto.

## 2. Crear un proyecto Supabase Cloud

1. Ve a https://supabase.com/
2. Crea un proyecto gratuito.
3. Copia los valores de `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Ejecuta las migraciones en tu proyecto Supabase (local o desde tu máquina):

```bash
cd /Users/erickbarrantes/code/csn-form-demo/supabase
npx supabase db push --project-ref <TU_PROYECTO> --yes
```

> Si usas Supabase Cloud, reemplaza `<TU_PROYECTO>` por el `project ref` de tu proyecto.

## 3. Desplegar el backend en Railway / Render

### Railway

1. Crea un proyecto en https://railway.app/
2. Conecta tu repositorio GitHub.
3. Selecciona la carpeta `apps/api` como raíz del servicio.
4. Configura el build y start:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:prod`
5. Agrega las variables de entorno:
   - `SUPABASE_URL` = URL de Supabase Cloud
   - `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` = URL pública del frontend (ej. `https://mi-app.vercel.app`)
   - `PORT` = `8090` si la plataforma lo requiere
6. Despliega el servicio.

### Render

1. Crea un `Web Service` en https://render.com/
2. Conecta tu repositorio GitHub.
3. Usa la carpeta `apps/api` como raíz.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start:prod`
6. Define variables de entorno iguales a las de Railway.

## 4. Desplegar el frontend en Vercel

1. Ve a https://vercel.com/
2. Conecta el mismo repositorio GitHub.
3. Crea un nuevo proyecto y selecciona la carpeta `apps/web`.
4. Configura el build:
   - Build command: `npm install && npm run build`
   - Output directory: `.next`
5. Agrega esta variable de entorno:
   - `NEXT_PUBLIC_API_URL` = `https://<TU_BACKEND>.railway.app` o la URL que te dé Render
6. Despliega.

## 5. Compartir el link

Cuando termine el despliegue del frontend, Vercel te dará un link público del tipo:

`https://<tu-proyecto>.vercel.app`

Ese será el link que puedes enviar a tus compañeros.

## 6. Verificación final

- Accede al frontend en la URL pública.
- Envía un formulario de prueba.
- Comprueba que el backend recibe solicitudes y que los datos se guardan en Supabase.

## Nota importante

El proyecto no funcionará en producción si el frontend apunta a un backend local o a una base de datos local. Debe usarse un backend desplegado y una base de datos Supabase en la nube.
