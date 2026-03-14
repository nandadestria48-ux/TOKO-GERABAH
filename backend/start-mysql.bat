@echo off
REM Script untuk start MySQL dan Backend

echo.
echo ========================================
echo  🗄️  Starting MySQL Server...
echo ========================================
echo.

REM Start XAMPP MySQL
"C:\xampp\mysql\bin\mysqld.exe" --console

REM Jika XAMPP MySQL tidak ditemukan, coba path lain
if errorlevel 1 (
    echo Trying alternative MySQL path...
    net start MySQL80
)

echo.
echo ✅ MySQL Server started!
echo.
