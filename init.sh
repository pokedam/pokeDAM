#!/bin/bash

# Función para cerrar los procesos en segundo plano al salir o presionar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Cerrando todos los servicios..."
    kill $BACKEND_PID $CLIENT_PID $REST_SERVER_PID 2>/dev/null
    exit
}

# Capturamos la señal de interrupción (Ctrl+C) para limpiar los procesos
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Inicializando el proyecto PokeDAM..."

# 1. shared_types: npm install y npm run build
echo "📦 [1/4] Procesando 'shared_types'..."
cd shared_types || exit
npm install
npm run build
cd ..

# 2. backend y client: npm install
echo "📦 [2/4] Instalando dependencias de 'backend'..."
cd backend || exit
npm install
cd ..

echo "📦 [3/4] Instalando dependencias de 'client'..."
cd client || exit
npm install
cd ..

# 3 y 4. Ejecutar backend, client, y rest-server en segundo plano (&)
echo "🔥 [4/4] Arrancando los servicios..."

cd backend || exit
echo "▶️ Iniciando Backend (npm start)..."
npm start &
BACKEND_PID=$!
cd ..

cd client || exit
echo "▶️ Iniciando Client (npm start)..."
# Pasamos CI=1 y NG_CLI_ANALYTICS=false para que Angular no pregunte NADA y no crashee
CI=1 NG_CLI_ANALYTICS=false npm start &
CLIENT_PID=$!
cd ..

# cd rest-server || exit
# echo "▶️ Iniciando Rest-Server (spring-boot:run)..."
# # Por si acaso el archivo no tuviera permisos de ejecución en Linux/GitBash
# chmod +x ./mvnw 2>/dev/null
# ./mvnw spring-boot:run &
# REST_SERVER_PID=$!
# cd ..

echo "========================================================"
echo "✅ Todos los servicios han arrancado en la misma terminal:"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Client PID: $CLIENT_PID"
echo "   - Rest-Server PID: $REST_SERVER_PID"
echo "   (Los registros de los tres se irán mostrando aquí)"
echo ""
echo "❗ IMPORTANTE: Presiona [Ctrl + C] para parar todos a la vez."
echo "========================================================"

# El wait hace que el script espere a que terminen los procesos hijos,
# manteniendo la terminal activa hasta que el usuario presione Ctrl+C.
wait
