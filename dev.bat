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
rem O Next escolhe outra porta sozinho se a 3000 estiver ocupada, e o endereco
rem impresso abaixo passa a mentir. Em vez de so avisar, liberamos a porta:
rem encerramos quem estiver escutando nela e so entao subimos. Ver ADR-024.
call :liberar_porta
if defined PORTA_OCUPADA (
    echo.
    echo  [^^!] A porta %PORT% continua ocupada.
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
goto :eof

rem ============================================================================
rem  :liberar_porta - encerra quem estiver escutando na porta %PORT%.
rem
rem  Define PORTA_OCUPADA quando, mesmo apos a tentativa, a porta continua presa
rem  (processo de outro usuario, servico elevado, socket em TIME_WAIT).
rem ============================================================================
:liberar_porta
set "PORTA_OCUPADA="

netstat -ano -p tcp | findstr /r /c:":%PORT% .*LISTENING" >nul 2>nul
if errorlevel 1 goto :eof

rem PID 0 (Idle) e 4 (System) nunca sao encerrados: nao sao o servidor de dev, e
rem taskkill neles ou falha ou derruba a maquina.
for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr /r /c:":%PORT% .*LISTENING"') do (
    if not "%%p"=="0" if not "%%p"=="4" (
        set "NOME_PROC=processo desconhecido"
        for /f "tokens=1 delims=," %%n in ('tasklist /fi "PID eq %%p" /fo csv /nh 2^>nul') do set "NOME_PROC=%%~n"
        echo.
        rem O ^^! escapa a exclamacao: com expansao adiada ligada, um sinal de
        rem exclamacao cru vira delimitador de variavel e some da saida.
        echo  [^^!] Porta %PORT% ocupada por !NOME_PROC! ^(PID %%p^) - encerrando.
        taskkill /f /t /pid %%p >nul 2>nul
        if errorlevel 1 (
            echo      [x] Nao foi possivel encerrar o PID %%p.
        ) else (
            echo      [ok] PID %%p encerrado.
        )
    )
)

rem O socket demora alguns instantes para ser devolvido pelo Windows depois do
rem taskkill; sem esta espera o Next ainda veria a porta ocupada.
set "PORTA_OCUPADA=1"
for /l %%i in (1,1,10) do (
    if defined PORTA_OCUPADA (
        netstat -ano -p tcp | findstr /r /c:":%PORT% .*LISTENING" >nul 2>nul
        if errorlevel 1 (
            set "PORTA_OCUPADA="
            echo      Porta %PORT% livre.
        ) else (
            ping -n 2 127.0.0.1 >nul
        )
    )
)
goto :eof
