@echo off
setlocal enabledelayedexpansion

rem ============================================================================
rem  Linktree Bondmann - subir o site localmente para teste
rem
rem  Duplo clique neste arquivo, ou "dev.bat" no terminal.
rem
rem    dev.bat            modo desenvolvimento (hot reload)  -> http://localhost:3000
rem    dev.bat prod       build de producao + servidor local
rem
rem  Nao substitui `npm run verify`, que e o que o CI roda antes do PR.
rem ============================================================================

cd /d "%~dp0"

set "PORT=3000"
set "MODE=%~1"
if "%MODE%"=="" set "MODE=dev"

echo.
echo  == Linktree Bondmann =========================================
echo.

rem --- Node presente? ---------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
    echo  [x] Node.js nao encontrado no PATH.
    echo      Instale a versao indicada em .nvmrc ^(Node 24^): https://nodejs.org
    goto :fim
)

for /f "delims=" %%v in ('node --version') do set "NODE_VERSION=%%v"
echo  Node !NODE_VERSION!

rem --- Dependencias instaladas? -----------------------------------------------
if not exist "node_modules" (
    echo.
    echo  Dependencias ausentes. Rodando npm ci --ignore-scripts...
    echo.
    call npm ci --ignore-scripts
    if errorlevel 1 (
        echo.
        echo  [x] Falha ao instalar as dependencias.
        goto :fim
    )
)

rem --- Porta livre? -----------------------------------------------------------
rem O Next escolhe outra porta sozinho se a 3000 estiver ocupada; o aviso existe
rem para o endereco impresso abaixo nao mentir.
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>nul
if not errorlevel 1 (
    echo.
    echo  [!] A porta %PORT% ja esta em uso.
    echo      O Next vai subir em outra porta - confira o endereco no log abaixo.
)

rem --- Sobe --------------------------------------------------------------------
if /i "%MODE%"=="prod" (
    echo.
    echo  Modo producao: build + servidor local.
    echo.
    call npm run build
    if errorlevel 1 (
        echo.
        echo  [x] O build falhou. Nada foi servido.
        goto :fim
    )
    echo.
    echo  Servindo em http://localhost:%PORT%   ^(Ctrl+C encerra^)
    echo.
    call npm run start
) else (
    echo.
    echo  Modo desenvolvimento com hot reload.
    echo  Abra http://localhost:%PORT%          ^(Ctrl+C encerra^)
    echo.
    call npm run dev
)

:fim
echo.
echo  Servidor encerrado.
pause
endlocal
