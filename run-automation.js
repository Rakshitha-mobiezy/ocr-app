const LoginAutomation = require('./login-automation');
const config = require('./config');

async function main() {
    console.log('🚀 Starting Login Automation with Python OCR');
    console.log('=' .repeat(50));
    
    const automation = new LoginAutomation();
    
    try {
        // Initialize browser
        console.log('Initializing browser...');
        await automation.initialize();
        
        // Run the automation process
        const result = await automation.handleLoginProcess(
            config.username,
            config.password,
            config.maxRetries
        );
        
        // Display results
        console.log('\n' + '='.repeat(50));
        if (result.success) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log(`📊 Completed in ${result.attempts} attempt(s)`);
            console.log(`🔤 Final CAPTCHA: ${result.captcha}`);
            
            // Show session status
            if (result.sessionSaved) {
                console.log('💾 Session saved successfully');
            } else {
                console.log('⚠️  Session save failed');
            }
            
            // Check navigation status
            if (result.navigation) {
                if (result.navigation.success) {
                    switch (result.navigation.method) {
                        case 'direct_redirect':
                            console.log('🎯 Directly redirected to Assign Plan page');
                            break;
                        case 'manual_navigation':
                            console.log('🎯 Successfully navigated to Assign Plan page');
                            break;
                        case 'home_page':
                            console.log('📍 Landed on Home page');
                            break;
                        case 'transaction_area':
                            console.log('📍 Landed in Transaction area');
                            break;
                        case 'unknown_page':
                            console.log(`📍 Logged in to: ${result.navigation.url}`);
                            break;
                    }
                } else {
                    console.log('⚠️  Login successful but navigation had issues');
                    if (result.navigation.error) {
                        console.log(`Error: ${result.navigation.error}`);
                    }
                }
            }
        } else {
            console.log('❌ LOGIN FAILED');
            console.log(`📊 Failed after ${result.attempts} attempts`);
            console.log('💡 Try checking username/password or OCR settings');
        }
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n💥 Fatal Error:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        // Always close browser
        await automation.close();
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n⚠️  Process interrupted by user');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the main function
main().catch(console.error);