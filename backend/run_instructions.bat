@echo off
REM ====================================================================
REM VoltSpot EV - NetBeans & Tomcat Build Verification Script
REM ====================================================================
echo ========================================================
echo VoltSpot EV - Charging Station Finder & Slot Booking
echo ========================================================
echo.
echo 1. Checking Java Version...
java -version
echo.
echo 2. NetBeans & Tomcat Instructions:
echo    - Launch Apache NetBeans IDE 24
echo    - Go to File -^> Open Project and select this 'backend' folder
echo    - In Tools -^> Servers, verify Apache Tomcat 9.0.84 is added
echo    - Right-click project -^> Run (F6)
echo.
echo 3. MySQL Workbench Instructions:
echo    - Open MySQL Workbench 8.0
echo    - Execute: database\voltspot_database_setup.sql
echo.
echo Default Logins:
echo    Admin:    admin@voltspot.in / admin123
echo    Operator: operator@voltspot.in / operator123
echo    Driver:   user@voltspot.in / user123
echo ========================================================
pause

