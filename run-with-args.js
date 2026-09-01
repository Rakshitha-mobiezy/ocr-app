const LoginAutomation = require('./login-automation');
const config = require('./config');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const params = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
            params[key] = value;
            if (value !== true) i++; // Skip the value
        }
    }
    
    return params;
}

async function main() {
    console.log('🚀 Starting Login Automation with Python OCR');
    console.log('=' .repeat(50));
    
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
    
    try {
        console.log('Initializing browser...');
        await automation.initialize();
        
        // Pass credentials to login
        const result = await automation.handleLoginProcess(
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
            
            const packResult = await automation.performPackManagementTasks(vcNumber);
            
            if (packResult) {
                console.log('✅ All tasks completed successfully!');
                console.log('🌐 Browser will stay open for 30 seconds...');
                await automation.page.waitForTimeout(30000);
            } else {
                console.log('⚠️ Login successful but Pack Management tasks failed');
                console.log('📸 Check debug screenshots for troubleshooting');
                await automation.page.waitForTimeout(10000);
            }
            
        } else {
            console.log('❌ LOGIN FAILED');
            console.log(`📊 Failed after ${result.attempts} attempts`);
        }
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n💥 Fatal Error:', error.message);
        console.error('Stack trace:', error.stack);
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
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the main function
main().catch(console.error);