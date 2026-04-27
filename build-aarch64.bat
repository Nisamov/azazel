@echo off
REM Build script for Windows (aarch64 preparation)
REM This script prepares the project for aarch64 deployment
REM I assume this is useless for now XD

echo ==========================================
echo Hikarune Build Script for aarch64
echo ==========================================

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build client
echo Building client...
cd client
call npm run build
cd ..

REM Build server
echo Building server...
cd server
call npm run build
cd ..

echo ==========================================
echo Build completed successfully!
echo ==========================================
echo.
echo To run the application:
echo   Development: pnpm dev
echo   Production:  pnpm start
echo.
echo Docker for aarch64:
echo   docker buildx build --platform linux/arm64 -f docker/Dockerfile.server .
echo   docker-compose -f docker/docker-compose.yml up