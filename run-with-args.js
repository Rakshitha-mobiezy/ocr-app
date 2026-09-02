// const LoginAutomation = require('./login-automation');
// const config = require('./config');

// // Parse command line arguments
// function parseArgs() {
//     const args = process.argv.slice(2);
//     const params = {};
    
//     for (let i = 0; i < args.length; i++) {
//         if (args[i].startsWith('--')) {
//             const key = args[i].slice(2);
//             const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
//             params[key] = value;
//             if (value !== true) i++; // Skip the value
//         }
//     }
    
//     return params;
// }

// async function main() {
//     console.log('🚀 Starting Login Automation with Python OCR');
//     console.log('=' .repeat(50));
    
//     // Get command line arguments
//     const args = parseArgs();
    
//     // Use provided values or fallback to config
//     const username = args.username || config.username;
//     const password = args.password || config.password;
//     const vcNumber = args.vc || args.vcnumber || config.vcNumber;
//     const maxRetries = args.retries || config.maxRetries;
    
//     console.log(`👤 Username: ${username}`);
//     console.log(`🔢 VC Number: ${vcNumber}`);
//     console.log(`🔄 Max Retries: ${maxRetries}`);
//     console.log('='.repeat(50));
    
//     const automation = new LoginAutomation();
    
//     try {
//         console.log('Initializing browser...');
//         await automation.initialize();
        
//         // Pass credentials to login
//         const result = await automation.handleLoginProcess(
//             username,
//             password,
//             maxRetries
//         );
        
//         console.log('\n' + '='.repeat(50));
//         if (result.success) {
//             console.log('✅ LOGIN SUCCESSFUL!');
//             console.log(`📊 Completed in ${result.attempts} attempt(s)`);
//             console.log(`🔤 Final CAPTCHA: ${result.captcha}`);
            
//             console.log('\n📦 Starting Pack Management Automation...');
            
//             const packResult = await automation.performPackManagementTasks(vcNumber);
            
//             if (packResult) {
//                 console.log('✅ All tasks completed successfully!');
//                 console.log('🌐 Browser will stay open for 30 seconds...');
//                 await automation.page.waitForTimeout(30000);
//             } else {
//                 console.log('⚠️ Login successful but Pack Management tasks failed');
//                 console.log('📸 Check debug screenshots for troubleshooting');
//                 await automation.page.waitForTimeout(10000);
//             }
            
//         } else {
//             console.log('❌ LOGIN FAILED');
//             console.log(`📊 Failed after ${result.attempts} attempts`);
//         }
//         console.log('='.repeat(50));
        
//     } catch (error) {
//         console.error('\n💥 Fatal Error:', error.message);
//         console.error('Stack trace:', error.stack);
//     } finally {
//         if (automation && automation.browser) {
//             try {
//                 await automation.close();
//             } catch (closeError) {
//                 console.log('⚠️ Browser already closed');
//             }
//         }
//     }
// }

// // Handle process termination gracefully
// process.on('SIGINT', () => {
//     console.log('\n⚠️ Process interrupted by user');
//     process.exit(0);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//     process.exit(1);
// });

// // Run the main function
// main().catch(console.error);



// 1111111111111111111111111111111111111111111111111111111111111111111111111111111

// const LoginAutomation = require('./login-automation');
// const config = require('./config');

// // Parse command line arguments
// function parseArgs() {
//     const args = process.argv.slice(2);
//     const params = {};
    
//     for (let i = 0; i < args.length; i++) {
//         if (args[i].startsWith('--')) {
//             const key = args[i].slice(2);
//             const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
//             params[key] = value;
//             if (value !== true) i++;
//         }
//     }
    
//     return params;
// }

// async function main() {
//     console.log('🚀 Starting Login Automation with Python OCR');
//     console.log('='.repeat(50));
    
//     // Get command line arguments
//     const args = parseArgs();
    
//     // Use provided values or fallback to config
//     const username = args.username || config.username;
//     const password = args.password || config.password;
//     const vcNumber = args.vc || args.vcnumber || config.vcNumber;
//     const maxRetries = args.retries || config.maxRetries;
    
//     console.log(`👤 Username: ${username}`);
//     console.log(`🔢 VC Number: ${vcNumber}`);
//     console.log(`🔄 Max Retries: ${maxRetries}`);
//     console.log('='.repeat(50));
    
//     const automation = new LoginAutomation();
//     let result = null;
    
//     try {
//         console.log('Initializing browser...');
//         await automation.initialize();
        
//         // Run login process
//         result = await automation.handleLoginProcess(
//             username,
//             password,
//             maxRetries
//         );
        
//         console.log('\n' + '='.repeat(50));
//         if (result.success) {
//             console.log('✅ LOGIN SUCCESSFUL!');
//             console.log(`📊 Completed in ${result.attempts} attempt(s)`);
//             console.log(`🔤 Final CAPTCHA: ${result.captcha}`);
            
//             console.log('\n📦 Starting Pack Management Automation...');
            
//             // Perform pack management tasks
//             const packResult = await automation.performPackManagementTasks(vcNumber);
            
//             if (packResult) {
//                 console.log('✅ All tasks completed successfully!');
                
//                 // Extract pre-end date from the page
//                 let preEndDate = null;
//                 try {
//                     // Look for pre-end date in the page
//                     preEndDate = await automation.page.evaluate(() => {
//                         // Try to find the pre-end date element
//                         const dateElements = document.querySelectorAll('td:has-text("Valid Upto"), td:has-text("Valid"), td:has-text("End"), td:has-text("Expiry")');
//                         for (const el of dateElements) {
//                             const nextTd = el.nextElementSibling;
//                             if (nextTd) {
//                                 return nextTd.textContent.trim();
//                             }
//                         }
//                         // Alternative: look for any date in the page
//                         const allText = document.body.textContent;
//                         const dateMatch = allText.match(/\d{2}-[A-Z]{3}-\d{2}/);
//                         if (dateMatch) {
//                             return dateMatch[0];
//                         }
//                         return null;
//                     });
                    
//                     console.log(`📅 Pre-End Date: ${preEndDate || 'Not found'}`);
//                 } catch (error) {
//                     console.log('⚠️ Could not extract pre-end date:', error.message);
//                 }
                
//                 // Save result to file for API to read
//                 const resultData = {
//                     status: 'success',
//                     username: username,
//                     vcNumber: vcNumber,
//                     preEndDate: preEndDate,
//                     completedAt: new Date().toISOString(),
//                     attempts: result.attempts,
//                     captcha: result.captcha
//                 };
                
//                 require('fs').writeFileSync('last_result.json', JSON.stringify(resultData, null, 2));
//                 console.log('📝 Result saved to last_result.json');
                
//                 // Keep browser open briefly
//                 await automation.page.waitForTimeout(5000);
                
//             } else {
//                 console.log('❌ Pack Management tasks failed');
//                 const resultData = {
//                     status: 'failure',
//                     username: username,
//                     vcNumber: vcNumber,
//                     error: 'Pack Management failed',
//                     completedAt: new Date().toISOString()
//                 };
//                 require('fs').writeFileSync('last_result.json', JSON.stringify(resultData, null, 2));
//             }
            
//         } else {
//             console.log('❌ LOGIN FAILED');
//             console.log(`📊 Failed after ${result.attempts} attempts`);
            
//             const resultData = {
//                 status: 'failure',
//                 username: username,
//                 vcNumber: vcNumber,
//                 error: 'Login failed',
//                 attempts: result.attempts,
//                 completedAt: new Date().toISOString()
//             };
//             require('fs').writeFileSync('last_result.json', JSON.stringify(resultData, null, 2));
//         }
//         console.log('='.repeat(50));
        
//     } catch (error) {
//         console.error('\n💥 Fatal Error:', error.message);
//         console.error('Stack trace:', error.stack);
        
//         const resultData = {
//             status: 'error',
//             username: username,
//             vcNumber: vcNumber,
//             error: error.message,
//             stack: error.stack,
//             completedAt: new Date().toISOString()
//         };
//         require('fs').writeFileSync('last_result.json', JSON.stringify(resultData, null, 2));
        
//     } finally {
//         if (automation && automation.browser) {
//             try {
//                 await automation.close();
//             } catch (closeError) {
//                 console.log('⚠️ Browser already closed');
//             }
//         }
//     }
// }

// // Handle process termination gracefully
// process.on('SIGINT', () => {
//     console.log('\n⚠️ Process interrupted by user');
//     process.exit(0);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//     process.exit(1);
// });

// main().catch(console.error);


const LoginAutomation = require('./login-automation');
const config = require('./config');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const params = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
            params[key] = value;
            if (value !== true) i++;
        }
    }
    
    return params;
}

// Save result to file
function saveResult(resultData) {
    try {
        const resultPath = path.join(__dirname, 'last_result.json');
        fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
        console.log('📝 Result saved to last_result.json');
    } catch (error) {
        console.error('❌ Error saving result:', error.message);
    }
}

async function main() {
    console.log('🚀 Starting Login Automation with Python OCR');
    console.log('='.repeat(50));
    
    // Get command line arguments
    const args = parseArgs();
    
    // Use provided values or fallback to config
    const username = args.username || config.username;
    const password = args.password || config.password;
    const vcNumber = args.vc || args.vcnumber || config.vcNumber;
    const maxRetries = args.retries || config.maxRetries;
    
    console.log(`👤 Username: ${username}`);
    console.log(`🔢 VC Number: ${vcNumber}`);
    console.log(`🔄 Max Retries: ${maxRetries}`);
    console.log('='.repeat(50));
    
    const automation = new LoginAutomation();
    let result = null;
    let preEndDate = null;
    
    try {
        console.log('Initializing browser...');
        await automation.initialize();
        
        // Run login process
        result = await automation.handleLoginProcess(
            username,
            password,
            maxRetries
        );
        
        console.log('\n' + '='.repeat(50));
        if (result.success) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log(`📊 Completed in ${result.attempts} attempt(s)`);
            console.log(`🔤 Final CAPTCHA: ${result.captcha}`);
            
            console.log('\n📦 Starting Pack Management Automation...');
            
            // Perform pack management tasks
            const packResult = await automation.performPackManagementTasks(vcNumber);
            
            if (packResult) {
                console.log('✅ All tasks completed successfully!');
                
                // Extract pre-end date from the page
                try {
                    preEndDate = await automation.getPreEndDate();
                    console.log(`📅 Pre-End Date: ${preEndDate || 'Not found'}`);
                } catch (error) {
                    console.log('⚠️ Could not extract pre-end date:', error.message);
                }
                
                // Save successful result
                const resultData = {
                    status: 'success',
                    username: username,
                    vcNumber: vcNumber,
                    preEndDate: preEndDate || null,
                    completedAt: new Date().toISOString(),
                    attempts: result.attempts,
                    captcha: result.captcha
                };
                saveResult(resultData);
                
                // Keep browser open briefly
                await automation.page.waitForTimeout(5000);
                
            } else {
                console.log('❌ Pack Management tasks failed');
                const resultData = {
                    status: 'failure',
                    username: username,
                    vcNumber: vcNumber,
                    error: 'Pack Management failed - could not click Renew button',
                    completedAt: new Date().toISOString(),
                    attempts: result.attempts,
                    captcha: result.captcha
                };
                saveResult(resultData);
            }
            
        } else {
            console.log('❌ LOGIN FAILED');
            console.log(`📊 Failed after ${result.attempts} attempts`);
            
            const resultData = {
                status: 'failure',
                username: username,
                vcNumber: vcNumber,
                error: 'Login failed after multiple attempts',
                attempts: result.attempts,
                completedAt: new Date().toISOString()
            };
            saveResult(resultData);
        }
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n💥 Fatal Error:', error.message);
        console.error('Stack trace:', error.stack);
        
        const resultData = {
            status: 'error',
            username: username,
            vcNumber: vcNumber,
            error: error.message,
            stack: error.stack,
            completedAt: new Date().toISOString()
        };
        saveResult(resultData);
        
    } finally {
        if (automation && automation.browser) {
            try {
                await automation.close();
            } catch (closeError) {
                console.log('⚠️ Browser already closed');
            }
        }
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n⚠️ Process interrupted by user');
    // Save error result
    saveResult({
        status: 'interrupted',
        error: 'Process interrupted by user',
        completedAt: new Date().toISOString()
    });
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    saveResult({
        status: 'error',
        error: 'Unhandled rejection: ' + reason,
        completedAt: new Date().toISOString()
    });
    process.exit(1);
});

main().catch(console.error);