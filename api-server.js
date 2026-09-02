// const express = require('express'); const { exec } = require('child_process'); const path = require('path'); const app = express(); const PORT = process.env.PORT || 3000; let isRunning = false; app.get('/trigger-automation', (req, res) => { if (isRunning) { return res.status(409).json({ status: 'already_running', message: 'Automation is already in progress.' }); } isRunning = true; res.json({ status: 'started', message: 'Automation triggered successfully.' }); const scriptPath = path.join(__dirname, 'run-automation.js'); exec(`node "${scriptPath}"`, (error, stdout, stderr) => { isRunning = false; if (error) { console.error(`Automation error: ${error.message}`); return; } console.log(`Automation output:\n${stdout}`); if (stderr) console.error(`Automation stderr:\n${stderr}`); }); }); app.get('/', (req, res) => { res.send('Automation API is running. Hit /trigger-automation to start the script.'); }); app.listen(PORT, () => { console.log(`API server listening on port ${PORT}`); });



// 1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
// const express = require('express');
// const { exec } = require('child_process');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // IMPORTANT: Add this middleware to parse JSON body
// app.use(express.json());

// let isRunning = false;
// let currentProcess = null;

// app.post('/trigger-automation', (req, res) => {
//     // Check if automation is already running
//     if (isRunning) {
//         return res.status(409).json({
//             status: 'already_running',
//             message: 'Automation is already in progress.'
//         });
//     }

//     // Extract parameters from request body
//     const { username, password, vcNumber } = req.body;

//     // Validate required parameters
//     if (!username || !password || !vcNumber) {
//         return res.status(400).json({
//             status: 'error',
//             message: 'Missing required parameters. Please provide username, password, and vcNumber',
//             required: ['username', 'password', 'vcNumber']
//         });
//     }

//     console.log(`📥 Received request:`);
//     console.log(`   Username: ${username}`);
//     console.log(`   Password: ${'*'.repeat(password.length)}`);
//     console.log(`   VC Number: ${vcNumber}`);

//     // Set running flag
//     isRunning = true;

//     // Send immediate response
//     res.json({
//         status: 'started',
//         message: 'Automation triggered successfully.',
//         data: { username, vcNumber }
//     });

//     // Prepare command with parameters
//     const scriptPath = path.join(__dirname, 'run-with-args.js');
    
//     // Pass parameters as command line arguments
//     const command = `node "${scriptPath}" --username "${username}" --password "${password}" --vc "${vcNumber}"`;
    
//     console.log(`🚀 Executing: ${command}`);

//     // Execute the automation script
//     currentProcess = exec(command, (error, stdout, stderr) => {
//         isRunning = false;
//         currentProcess = null;

//         if (error) {
//             console.error(`❌ Automation error: ${error.message}`);
//             // Log error to file for debugging
//             fs.appendFileSync('automation_errors.log', 
//                 `[${new Date().toISOString()}] Error: ${error.message}\n${stderr}\n\n`
//             );
//             return;
//         }

//         console.log(`✅ Automation output:\n${stdout}`);
//         if (stderr) {
//             console.error(`⚠️ Automation stderr:\n${stderr}`);
//         }

//         // Save output to log file
//         fs.appendFileSync('automation_output.log', 
//             `[${new Date().toISOString()}]\n${stdout}\n${stderr}\n${'='.repeat(60)}\n\n`
//         );
//     });

//     // Optional: Handle process timeout (kill after 5 minutes)
//     setTimeout(() => {
//         if (currentProcess && isRunning) {
//             console.log('⏰ Automation timeout reached, killing process...');
//             currentProcess.kill();
//             isRunning = false;
//             currentProcess = null;
//         }
//     }, 300000); // 5 minutes timeout
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//     res.json({
//         status: 'healthy',
//         isRunning: isRunning,
//         timestamp: new Date().toISOString()
//     });
// });

// // Status endpoint to check current automation status
// app.get('/status', (req, res) => {
//     res.json({
//         isRunning: isRunning,
//         message: isRunning ? 'Automation is currently running' : 'Automation is idle'
//     });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//     res.json({
//         service: 'Hathway Automation API',
//         version: '1.0.0',
//         endpoints: {
//             'POST /trigger-automation': 'Trigger automation with username, password, vcNumber in JSON body',
//             'GET /health': 'Check API health',
//             'GET /status': 'Check automation status'
//         },
//         example: {
//             method: 'POST',
//             url: 'https://automation.mobiezy.in/trigger-automation',
//             body: {
//                 username: 'ANUPAMAD4',
//                 password: 'DmytR0Oy',
//                 vcNumber: 'T403221167147'
//             }
//         }
//     });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('💥 Server Error:', err);
//     res.status(500).json({
//         status: 'error',
//         message: 'Internal server error',
//         error: err.message
//     });
// });

// app.listen(PORT, () => {
//     console.log(`🚀 API server listening on port ${PORT}`);
//     console.log(`📍 Health check: http://localhost:${PORT}/health`);
//     console.log(`📍 Trigger endpoint: http://localhost:${PORT}/trigger-automation`);
// });


const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execPromise = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

let isRunning = false;
let currentProcess = null;

// Helper function to wait for a file to be created
async function waitForFile(filePath, timeout = 120000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                // Try to parse JSON to ensure it's valid
                JSON.parse(content);
                return true;
            } catch (e) {
                // File exists but might be incomplete, wait a bit more
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
}

// Helper function to get result from file
function getResult() {
    try {
        const resultPath = path.join(__dirname, 'last_result.json');
        if (fs.existsSync(resultPath)) {
            const data = fs.readFileSync(resultPath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Error reading result:', error.message);
        return null;
    }
}

// Main trigger endpoint - WAITS FOR COMPLETION
app.post('/trigger-automation', async (req, res) => {
    // Check if automation is already running
    if (isRunning) {
        return res.status(409).json({
            status: 'already_running',
            message: 'Automation is already in progress. Please wait.'
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

    // Delete old result file
    try {
        const resultPath = path.join(__dirname, 'last_result.json');
        if (fs.existsSync(resultPath)) {
            fs.unlinkSync(resultPath);
        }
    } catch (e) {}

    // Set running flag
    isRunning = true;

    // Prepare command with parameters
    const scriptPath = path.join(__dirname, 'run-with-args.js');
    const command = `node "${scriptPath}" --username "${username}" --password "${password}" --vc "${vcNumber}"`;
    
    console.log(`🚀 Executing: ${command}`);

    // Execute the automation script asynchronously
    currentProcess = exec(command, (error, stdout, stderr) => {
        isRunning = false;
        currentProcess = null;

        if (error) {
            console.error(`❌ Automation error: ${error.message}`);
            // Log error to file
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

    // Wait for the automation to complete (timeout after 5 minutes)
    try {
        console.log('⏳ Waiting for automation to complete...');
        res.setTimeout(300000); // 5 minute timeout for the response
        
        // Poll for result file
        const resultPath = path.join(__dirname, 'last_result.json');
        const fileCreated = await waitForFile(resultPath, 300000); // 5 minute timeout
        
        if (fileCreated) {
            // Read the result
            const result = getResult();
            
            if (result) {
                console.log(`✅ Automation completed: ${result.status}`);
                
                // Send the result back to the client
                return res.json({
                    status: result.status,
                    message: result.status === 'success' ? 'Automation completed successfully' : 'Automation failed',
                    data: {
                        username: result.username || username,
                        vcNumber: result.vcNumber || vcNumber,
                        preEndDate: result.preEndDate || null,
                        attempts: result.attempts || 0,
                        captcha: result.captcha || null,
                        completedAt: result.completedAt || new Date().toISOString()
                    },
                    error: result.error || null
                });
            } else {
                return res.status(500).json({
                    status: 'error',
                    message: 'Automation completed but result file is invalid',
                    data: null
                });
            }
        } else {
            // Timeout - kill the process if still running
            if (currentProcess) {
                console.log('⏰ Automation timeout reached, killing process...');
                currentProcess.kill();
                isRunning = false;
                currentProcess = null;
            }
            
            return res.status(408).json({
                status: 'timeout',
                message: 'Automation timed out after 5 minutes',
                data: null
            });
        }
        
    } catch (error) {
        console.error('❌ Error during automation:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during automation',
            error: error.message,
            data: null
        });
    } finally {
        isRunning = false;
        currentProcess = null;
    }
});

// Status endpoint (non-blocking)
app.get('/status', (req, res) => {
    res.json({
        isRunning: isRunning,
        message: isRunning ? 'Automation is currently running' : 'Automation is idle'
    });
});

// Get last result (non-blocking)
app.get('/result', (req, res) => {
    try {
        const resultPath = path.join(__dirname, 'last_result.json');
        if (fs.existsSync(resultPath)) {
            const data = fs.readFileSync(resultPath, 'utf8');
            const result = JSON.parse(data);
            res.json({
                status: 'success',
                data: result
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'No result found. Run automation first.'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        isRunning: isRunning,
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Hathway Automation API',
        version: '1.1.0',
        endpoints: {
            'POST /trigger-automation': 'Trigger automation with username, password, vcNumber in JSON body (waits for completion)',
            'GET /status': 'Check if automation is running',
            'GET /result': 'Get last automation result',
            'GET /health': 'Check API health'
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
    console.log(`📍 Status check: http://localhost:${PORT}/status`);
    console.log(`📍 Results: http://localhost:${PORT}/result`);
});