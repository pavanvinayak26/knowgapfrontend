# Knowgap Deployment Guide

## Prerequisites
- GitHub account with the repository pushed
- Render account (https://render.com)
- Hugging Face API token (for AI features)

## Deployment Steps

### 1. Create PostgreSQL Database on Render

1. Log in to Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `knowgap-postgres`
   - **Database**: `knowgapdb`
   - **User**: `postgres`
   - **Region**: Choose closest to you
   - **Plan**: Free tier (or paid)
4. Create database
5. Copy the connection string (you'll use it in the next step)

### 2. Deploy Backend Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `knowgap-backend`
   - **Environment**: `Docker`
   - **Build Command**: `docker build -f backend/Dockerfile -t knowgap-backend backend/`
   - **Start Command**: (leave empty, handled by Docker)
   - **Root Directory**: Leave empty (Docker handles this)

5. Under **Environment Variables**, add:
   ```
   PORT=8086
   SPRING_DATASOURCE_URL=<your-postgres-connection-string-from-step-1>
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=<password-from-postgres-creation>
   SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
   SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
   JWT_SECRET=use-a-secure-random-string-here
   HF_API_TOKEN=<your-hugging-face-token>
   HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2
   CORS_ALLOWED_ORIGINS=<your-frontend-url>
   ```

6. Click "Create Web Service"
7. Wait for deployment to complete. Note the backend URL (e.g., `https://knowgap-backend.onrender.com`)

### 3. Deploy Frontend Service

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `knowgap-frontend`
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Root Directory**: Leave empty

5. Under **Environment Variables**, add:
   ```
   REACT_APP_API_BASE_URL=<your-backend-url-from-step-2>
   ```

6. Click "Create Static Site"
7. Wait for deployment to complete

### 4. Verify Deployment

1. Visit your frontend URL
2. Test login/registration (creates users in PostgreSQL)
3. Test quiz functionality
4. Check backend health: `<backend-url>/api/home`

## Local Development with Docker Compose

To test everything locally before deploying:

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local settings (keep defaults for local testing)

# Start all services
docker-compose up -d

# Backend: http://localhost:8086
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5432

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## Render.yaml Configuration

The `render.yaml` file already contains the deployment configuration. Render will automatically use it when you connect your repository.

## Environment Variables Reference

### Backend Variables
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation
- `HF_API_TOKEN`: Hugging Face API token for AI features
- `CORS_ALLOWED_ORIGINS`: Frontend URL(s) allowed to access API

### Frontend Variables
- `REACT_APP_API_BASE_URL`: Backend API URL

## Troubleshooting

### Backend fails to start
- Check PostgreSQL connection string
- Verify database exists
- Check HF_API_TOKEN is valid

### Frontend can't reach backend
- Verify `REACT_APP_API_BASE_URL` matches backend URL
- Check `CORS_ALLOWED_ORIGINS` includes frontend URL
- Verify backend health at `/api/home`

### Database connection errors
- Copy exact connection string from Render PostgreSQL dashboard
- Verify password is correct
- Check database name is `knowgapdb`

## Next Steps

After deployment:
1. Test all features thoroughly
2. Set up monitoring/alerts in Render
3. Configure custom domain (if desired)
4. Set up automatic backups for database
