// const express = require('express'); const { exec } = require('child_process'); const path = require('path'); const app = express(); const PORT = process.env.PORT || 3000; let isRunning = false; app.get('/trigger-automation', (req, res) => { if (isRunning) { return res.status(409).json({ status: 'already_running', message: 'Automation is already in progress.' }); } isRunning = true; res.json({ status: 'started', message: 'Automation triggered successfully.' }); const scriptPath = path.join(__dirname, 'run-automation.js'); exec(`node "${scriptPath}"`, (error, stdout, stderr) => { isRunning = false; if (error) { console.error(`Automation error: ${error.message}`); return; } console.log(`Automation output:\n${stdout}`); if (stderr) console.error(`Automation stderr:\n${stderr}`); }); }); app.get('/', (req, res) => { res.send('Automation API is running. Hit /trigger-automation to start the script.'); }); app.listen(PORT, () => { console.log(`API server listening on port ${PORT}`); });

const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: Add this middleware to parse JSON body
app.use(express.json());

let isRunning = false;
let currentProcess = null;

app.post('/trigger-automation', (req, res) => {
    // Check if automation is already running
    if (isRunning) {
        return res.status(409).json({
            status: 'already_running',
            message: 'Automation is already in progress.'
        });
    }

    // Extract parameters from request body
    const { username, password, vcNumber } = req.body;

    // Validate required parameters
    if (!username || !password || !vcNumber) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required parameters. Please provide username, password, and vcNumber',
            required: ['username', 'password', 'vcNumber']
        });
    }

    console.log(`📥 Received request:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${'*'.repeat(password.length)}`);
    console.log(`   VC Number: ${vcNumber}`);

    // Set running flag
    isRunning = true;

    // Send immediate response
    res.json({
        status: 'started',
        message: 'Automation triggered successfully.',
        data: { username, vcNumber }
    });

    // Prepare command with parameters
    const scriptPath = path.join(__dirname, 'run-with-args.js');
    
    // Pass parameters as command line arguments
    const command = `node "${scriptPath}" --username "${username}" --password "${password}" --vc "${vcNumber}"`;
    
    console.log(`🚀 Executing: ${command}`);

    // Execute the automation script
    currentProcess = exec(command, (error, stdout, stderr) => {
        isRunning = false;
        currentProcess = null;

        if (error) {
            console.error(`❌ Automation error: ${error.message}`);
            // Log error to file for debugging
            fs.appendFileSync('automation_errors.log', 
                `[${new Date().toISOString()}] Error: ${error.message}\n${stderr}\n\n`
            );
            return;
        }

        console.log(`✅ Automation output:\n${stdout}`);
        if (stderr) {
            console.error(`⚠️ Automation stderr:\n${stderr}`);
        }

        // Save output to log file
        fs.appendFileSync('automation_output.log', 
            `[${new Date().toISOString()}]\n${stdout}\n${stderr}\n${'='.repeat(60)}\n\n`
        );
    });

    // Optional: Handle process timeout (kill after 5 minutes)
    setTimeout(() => {
        if (currentProcess && isRunning) {
            console.log('⏰ Automation timeout reached, killing process...');
            currentProcess.kill();
            isRunning = false;
            currentProcess = null;
        }
    }, 300000); // 5 minutes timeout
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        isRunning: isRunning,
        timestamp: new Date().toISOString()
    });
});

// Status endpoint to check current automation status
app.get('/status', (req, res) => {
    res.json({
        isRunning: isRunning,
        message: isRunning ? 'Automation is currently running' : 'Automation is idle'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Hathway Automation API',
        version: '1.0.0',
        endpoints: {
            'POST /trigger-automation': 'Trigger automation with username, password, vcNumber in JSON body',
            'GET /health': 'Check API health',
            'GET /status': 'Check automation status'
        },
        example: {
            method: 'POST',
            url: 'https://automation.mobiezy.in/trigger-automation',
            body: {
                username: 'ANUPAMAD4',
                password: 'DmytR0Oy',
                vcNumber: 'T403221167147'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API server listening on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Trigger endpoint: http://localhost:${PORT}/trigger-automation`);
});