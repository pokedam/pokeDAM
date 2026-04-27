PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill $BACKEND_PID $CLIENT_PID $REST_SERVER_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM EXIT # Capture Ctrl+C to clean up processes

echo "🚀 Initializing PokeDAM project..."

# 1. shared_types: npm install and npm run build
echo "📦 [1/4] Processing 'shared_types'..."
cd shared_types || exit
npm install

# Check args and run rebuild if --force or -f is passed
for arg in "$@"; do
    if [[ "$arg" == "--force" || "$arg" == "-f" ]]; then
        echo "♻️ [shared_types] --force/-f enabled: running 'npm run rebuild'..."
        npm run rebuild
        break
    fi
done

npm run build
cd ..

# 2. backend and client: npm install
echo "📦 [2/4] Installing dependencies for 'backend'..."
cd backend || exit
npm install
cd ..

echo "📦 [3/4] Installing dependencies for 'client'..."
cd client || exit
npm install
cd ..

# 3 and 4. Run backend, client, and rest-server in background (&)
echo "🔥 [4/4] Starting services..."

cd rest-server || exit
echo "▶️ Starting Rest-Server (spring-boot:run)..."
# Ensure execution permission in case it's missing (Linux/GitBash)
chmod +x ./mvnw 2>/dev/null
MAVEN_USER_HOME="$PROJECT_DIR/rest-server/.m2" ./mvnw spring-boot:run &
REST_SERVER_PID=$!
cd ..

cd backend || exit
echo "▶️ Starting Backend (npm start)..."
npm start &
BACKEND_PID=$!
cd ..

cd client || exit
echo "▶️ Starting Client (npm start)..."
# Set CI=1 and NG_CLI_ANALYTICS=false so Angular does not prompt or crash
CI=1 NG_CLI_ANALYTICS=false npm start &
CLIENT_PID=$!
cd ..

echo "========================================================"
echo "✅ All services have started in the same terminal:"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Client PID: $CLIENT_PID"
echo "   - Rest-Server PID: $REST_SERVER_PID"
echo "   (Logs from all three will be displayed here)"
echo ""
echo "❗ IMPORTANT: Press [Ctrl + C] to stop everything at once."
echo "========================================================"

# wait keeps the script running until child processes exit,
# keeping the terminal active until the user presses Ctrl+C.
wait