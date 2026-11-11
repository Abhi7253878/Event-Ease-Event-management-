@echo off
title EventEase
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist backend\node_modules call npm install --prefix backend
if not exist frontend\node_modules call npm install --prefix frontend
if not exist backend\.env copy backend\.env.example backend\.env
echo Starting EventEase: API http://localhost:5000  ^|  Web http://localhost:5173
start "" http://localhost:5173
npm run dev
