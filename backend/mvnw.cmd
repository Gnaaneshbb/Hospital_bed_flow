@echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
if "%DIRNAME:~-1%" == "\" set DIRNAME=%DIRNAME:~0,-1%
set WRAPPER_JAR="%DIRNAME%\.mvn\wrapper\maven-wrapper.jar"

if not exist %WRAPPER_JAR% (
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%DIRNAME%\.mvn\wrapper\maven-wrapper.jar')"
)

java -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%DIRNAME%" org.apache.maven.wrapper.MavenWrapperMain %*
