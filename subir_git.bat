@echo off
echo Subiendo El Gran Capitalista a GitHub...
cd /d "%~dp0"
git add -A
git commit -m "fix: v1.2.9 - ranking auto-push+fetch cada 60s, no hace falta boton manual"
git push origin main
echo.
echo Listo! Revisa arriba si hay errores.
pause
