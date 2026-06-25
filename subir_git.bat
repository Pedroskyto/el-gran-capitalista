@echo off
echo Subiendo El Gran Capitalista a GitHub...
cd /d "%~dp0"
git add -A
git commit -m "feat: v1.2.5 - layout responsive, badge misiones fix, ranking auto-save"
git push origin main
echo.
echo Listo! Revisa arriba si hay errores.
pause
