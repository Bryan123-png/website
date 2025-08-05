@echo off
echo Creating deployment package...

:: Create a deployment folder
if exist "deployment_package" rmdir /s /q "deployment_package"
mkdir "deployment_package"

:: Copy build files
echo Copying React build files...
xcopy "client\build\*" "deployment_package\" /E /I /Y

:: Copy server files for full deployment
echo Copying server files...
mkdir "deployment_package\server"
xcopy "server\*" "deployment_package\server\" /E /I /Y

:: Copy root files
echo Copying configuration files...
copy "package.json" "deployment_package\"
copy "DEPLOYMENT.md" "deployment_package\"
copy "UPLOAD_TO_SERVER.md" "deployment_package\"
copy ".cpanel.yml" "deployment_package\"
copy ".htaccess" "deployment_package\"

echo.
echo ========================================
echo Deployment package created successfully!
echo ========================================
echo.
echo For STATIC HOSTING: Upload contents of 'deployment_package' folder (except server folder)
echo For FULL APPLICATION: Upload entire 'deployment_package' folder
echo.
echo Files are ready in: deployment_package\
echo.
pause