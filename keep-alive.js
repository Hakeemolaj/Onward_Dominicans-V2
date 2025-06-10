// Keep-Alive Script for Render Free Tier
// This script pings your backend every 10 minutes to prevent it from sleeping
// Run this on your local machine or a free service like GitHub Actions

const https = require('https');

const BACKEND_URL = 'https://onward-dominicans-backend.onrender.com/api/health';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

function pingBackend() {
    const timestamp = new Date().toISOString();
    
    https.get(BACKEND_URL, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log(`✅ [${timestamp}] Backend is alive - Status: ${res.statusCode}`);
            } else {
                console.log(`⚠️  [${timestamp}] Backend responded with status: ${res.statusCode}`);
            }
        });
    }).on('error', (err) => {
        console.log(`❌ [${timestamp}] Error pinging backend:`, err.message);
    });
}

function startKeepAlive() {
    console.log('🚀 Starting keep-alive service for Onward Dominicans backend');
    console.log(`📡 Pinging ${BACKEND_URL} every 10 minutes`);
    console.log('⏰ Press Ctrl+C to stop\n');
    
    // Ping immediately
    pingBackend();
    
    // Set up interval
    setInterval(pingBackend, PING_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Keep-alive service stopped');
    process.exit(0);
});

// Start the service
startKeepAlive();
