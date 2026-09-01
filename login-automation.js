const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const HybridCaptchaSolver = require('./hybrid-captcha-solver');
const config = require('./config');

class LoginAutomation {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://partners.hathway-connect.com/login.aspx';
        this.captchaSolver = new HybridCaptchaSolver();
    }

    async initialize() {
        // Launch browser with necessary options
        this.browser = await chromium.launch({
            headless: false, // Set to true for headless mode
            slowMo: 1000,    // Slow down actions for better visibility
        });
        
        this.page = await this.browser.newPage();
        
        // Set viewport and user agent
        await this.page.setViewportSize({ width: 1280, height: 720 });
        await this.page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
    }

    async navigateToLogin() {
        console.log('Navigating to login page...');
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(2000);
    }

    async fillCredentials(username, password) {
        console.log('Filling login credentials...');
        
        // Fill username
        await this.page.fill('#txtUsername', username);
        console.log(`Filled username: ${username}`);
        
        // Fill password
        await this.page.fill('#txtPassword', password);
        console.log('Filled password');
    }

    async clearSession() {
        console.log('🧹 Clearing browser session...');
        
        // Clear all cookies
        const context = this.page.context();
        await context.clearCookies();
        
        // Clear localStorage and sessionStorage
        await this.page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        console.log('✅ Session cleared');
    }

    async solveCaptcha() {
        console.log('Starting 6-digit CAPTCHA solving with Python OCR...');
        
        try {
            // Wait for CAPTCHA image to load
            await this.page.waitForSelector('#imgCaptcha', { timeout: 10000 });
            
            // Take screenshot of the CAPTCHA image
            const captchaElement = await this.page.$('#imgCaptcha');
            if (!captchaElement) {
                throw new Error('CAPTCHA image not found');
            }
            
            // Get the bounding box of the CAPTCHA image
            const boundingBox = await captchaElement.boundingBox();
            
            // Take screenshot of just the CAPTCHA area
            const captchaBuffer = await this.page.screenshot({
                clip: {
                    x: boundingBox.x,
                    y: boundingBox.y,
                    width: boundingBox.width,
                    height: boundingBox.height
                }
            });
            
            // Save CAPTCHA image for debugging
            const captchaPath = path.join(__dirname, 'captcha.png');
            fs.writeFileSync(captchaPath, captchaBuffer);
            console.log('📸 CAPTCHA image saved for processing...');
            
            // Use Python OCR bridge
            console.log('🐍 Using Python OCR (proven working method)...');
            const result = await this.captchaSolver.solveCaptcha(captchaBuffer, captchaPath);
            
            if (!result.success) {
                throw new Error(`CAPTCHA solving failed: ${result.error}`);
            }
            
            const captchaText = result.captcha;
            console.log(`✅ 6-digit CAPTCHA solved: "${captchaText}" (${result.confidence}% confidence)`);
            
            // Fill the CAPTCHA input
            await this.page.fill('#txtcaptcha', captchaText);
            console.log('📝 CAPTCHA filled in input field');
            
            return captchaText;
            
        } catch (error) {
            console.error('💥 CAPTCHA solving failed:', error.message);
            throw error;
        }
    }

    async refreshCaptcha() {
        console.log('Refreshing CAPTCHA...');
        await this.page.click('#imgcatcharefresh');
        await this.page.waitForTimeout(2000); // Wait for new CAPTCHA to load
    }

    async submitForm() {
        console.log('Submitting login form...');
        await this.page.click('#ibtLogIn');
        
        // Wait for navigation after login submission
        try {
            console.log('⏳ Waiting for login response and redirect...');
            
            // Wait for any navigation to occur
            await this.page.waitForLoadState('networkidle', { timeout: 15000 });
            
            // Give it a moment for any additional redirects
            await this.page.waitForTimeout(3000);
            
            const currentUrl = this.page.url();
            console.log(`Final URL after login: ${currentUrl}`);
            
            // Check if we successfully logged in (not on login page anymore)
            if (!currentUrl.includes('login')) {
                console.log('✅ Login successful - redirected away from login page');
                return true;
            } else {
                console.log('❌ Still on login page - login might have failed');
                return false;
            }
            
        } catch (error) {
            console.log('Navigation timeout or error:', error.message);
            
            // Check current URL even if navigation timed out
            const currentUrl = this.page.url();
            console.log(`Current URL after timeout: ${currentUrl}`);
            
            if (!currentUrl.includes('login')) {
                console.log('✅ Login appears successful despite navigation timeout');
                return true;
            } else {
                console.log('❌ Still on login page - might need to retry CAPTCHA');
                return false;
            }
        }
    }

    async handlePostLogin() {
        console.log('🔍 Checking final landing page...');
        
        try {
            // Give a moment for any final redirects to complete
            await this.page.waitForTimeout(2000);
            
            const currentUrl = this.page.url();
            console.log(`Final URL: ${currentUrl}`);
            
            // Check what page we landed on
            if (currentUrl.includes('frmAssignPlan.aspx')) {
                console.log('✅ Successfully landed on Assign Plan page');
                return { success: true, method: 'direct_redirect', url: currentUrl };
            } else if (currentUrl.includes('Home.aspx')) {
                console.log('📍 Landed on Home page - navigating to Assign Plan...');
                
                // Try to navigate directly to Assign Plan page
                try {
                    const assignPlanUrl = currentUrl.replace('/Home.aspx', '/frmAssignPlan.aspx');
                    console.log(`🎯 Navigating to: ${assignPlanUrl}`);
                    
                    await this.page.goto(assignPlanUrl, { waitUntil: 'networkidle' });
                    await this.page.waitForTimeout(2000);
                    
                    const newUrl = this.page.url();
                    console.log(`Successfully navigated to: ${newUrl}`);
                    
                    if (newUrl.includes('frmAssignPlan.aspx')) {
                        console.log('✅ Successfully reached Assign Plan page');
                        return { success: true, method: 'manual_navigation', url: newUrl };
                    } else {
                        console.log('⚠️  Navigation attempted but ended up elsewhere');
                        return { success: false, method: 'navigation_failed', url: newUrl };
                    }
                    
                } catch (navError) {
                    console.error('❌ Failed to navigate to Assign Plan:', navError.message);
                    return { success: false, method: 'navigation_error', error: navError.message };
                }
            } else if (currentUrl.includes('Transaction')) {
                console.log('📍 Landed on Transaction area');
                return { success: true, method: 'transaction_area', url: currentUrl };
            } else {
                console.log('📍 Landed on unknown page');
                return { success: true, method: 'unknown_page', url: currentUrl };
            }
            
        } catch (error) {
            console.error('❌ Error checking post-login page:', error.message);
            return { success: false, error: error.message };
        }
    }

    async clickPackManagement() {
        console.log('Looking for Pack Management button...');
        
        try {
            // Wait for the Pack Management image to be available
            await this.page.waitForSelector('#MasterBody_imgPackManagement', { timeout: 5000 });
            console.log('Pack Management button found!');
            
            // Click the Pack Management image
            await this.page.click('#MasterBody_imgPackManagement');
            console.log('✅ Pack Management button clicked successfully');
            
            // Wait for page to load after clicking
            await this.page.waitForTimeout(3000);
            
            // Check if navigation occurred
            const currentUrl = this.page.url();
            console.log(`Current URL after Pack Management click: ${currentUrl}`);
            
            return { success: true, method: 'manual_click', url: currentUrl };
            
        } catch (error) {
            console.error('❌ Pack Management button not found or click failed:', error.message);
            
            // Take a screenshot for debugging
            try {
                await this.page.screenshot({ path: 'pack_management_error.png', fullPage: true });
                console.log('Screenshot saved as pack_management_error.png for debugging');
            } catch (screenshotError) {
                console.error('Could not save screenshot:', screenshotError.message);
            }
            
            return { success: false, error: error.message };
        }
    }

    // Add this method to the LoginAutomation class
    async performPackManagementTasks(vcNumber) {
        console.log('\n📦 Starting Pack Management Tasks...');
        
        try {
            // Import the PackManagementAutomation class
            const PackManagementAutomation = require('./pack-management.js');
            const packManager = new PackManagementAutomation(this.page);
            
            // Check if we're on the right page
            const currentUrl = this.page.url();
            if (!currentUrl.includes('frmAssignPlan.aspx')) {
                console.log('⚠️ Not on Pack Management page. Trying to navigate...');
                // Try to navigate to Pack Management
                const navResult = await this.navigateToPackManagement();
                if (!navResult) {
                    console.log('❌ Could not navigate to Pack Management');
                    return false;
                }
            }
            
            // Perform the renewal process
            const result = await packManager.performFullRenewal(vcNumber);
            
            if (result) {
                console.log('✅ Pack Management tasks completed successfully!');
            } else {
                console.log('❌ Pack Management tasks failed');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Error in Pack Management:', error.message);
            return false;
        }
    }

    async handleLoginProcess(username, password, maxRetries = 3) {
        let attempts = 0;
        
        
        while (attempts < maxRetries) {
            try {
                console.log(`\n--- Attempt ${attempts + 1} of ${maxRetries} ---`);
                
                // Navigate to the page
                await this.navigateToLogin();
                
                // Fill credentials
                await this.fillCredentials(username, password);
                
                // Solve CAPTCHA
                const captchaText = await this.solveCaptcha();
                
                // Submit form
                const success = await this.submitForm();
                
                if (success) {
                    console.log('✅ Login process completed successfully!');
                    
                    // Handle post-login navigation (automatic redirects or Pack Management click)
                    console.log('\n🎯 Handling post-login navigation...');
                    const postLoginResult = await this.handlePostLogin();
                    
                    if (postLoginResult.success) {
                        let message = '';
                        switch (postLoginResult.method) {
                            case 'direct_redirect':
                                message = '🎯 Successfully redirected directly to Assign Plan page';
                                break;
                            case 'manual_navigation':
                                message = '🎯 Successfully navigated to Assign Plan page from Home page';
                                break;
                            case 'home_page':
                                message = '📍 Landed on Home page after login';
                                break;
                            case 'transaction_area':
                                message = '📍 Landed in Transaction area';
                                break;
                            case 'unknown_page':
                                message = `📍 Logged in successfully (URL: ${postLoginResult.url})`;
                                break;
                        }
                        console.log(message);
                        
                        // Save session after successful navigation
                        console.log('\n💾 Saving login session...');
                        const sessionSaved = await this.saveSession();
                        
                        return { 
                            success: true, 
                            attempts: attempts + 1, 
                            captcha: captchaText,
                            navigation: postLoginResult,
                            sessionSaved: sessionSaved
                        };
                    } else {
                        console.log('⚠️  Login successful but post-login navigation failed');
                        return { 
                            success: true, 
                            attempts: attempts + 1, 
                            captcha: captchaText,
                            navigation: postLoginResult,
                            sessionSaved: false
                        };
                    }
                } else {
                    console.log('❌ Login submission failed, retrying...');
                }
                
            } catch (error) {
                console.error(`Attempt ${attempts + 1} failed:`, error.message);
                
                // Try refreshing CAPTCHA if we're still on the page
                try {
                    const currentUrl = this.page.url();
                    if (currentUrl.includes('login')) {
                        await this.refreshCaptcha();
                        await this.page.waitForTimeout(1000);
                    }
                } catch (refreshError) {
                    console.error('Could not refresh CAPTCHA:', refreshError.message);
                }
            }
            
            attempts++;
            
            if (attempts < maxRetries) {
                console.log(`Waiting before next attempt...`);
                await this.page.waitForTimeout(3000);
            }
        }
        
        console.log(`❌ Failed to complete login after ${maxRetries} attempts`);
        return { success: false, attempts: attempts };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('Browser closed');
        }
    }

    async saveSession() {
        try {
            // Get cookies and storage state
            const cookies = await this.page.context().cookies();
            const storageState = await this.page.context().storageState();
            
            const sessionData = {
                cookies: cookies,
                storageState: storageState,
                timestamp: new Date().toISOString(),
                baseUrl: 'https://cg.hathway-connect.com'
            };
            
            const sessionPath = path.join(__dirname, 'session.json');
            fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
            console.log('💾 Session saved to session.json');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save session:', error.message);
            return false;
        }
    }
}

// Usage example
async function runLoginAutomation() {
    const automation = new LoginAutomation();
    
    try {
        await automation.initialize();
        
        // Replace with your actual credentials
        const username = 'your_username'; // Your login username
        const password = 'your_password'; // Your login password
        
        const result = await automation.handleLoginProcess(username, password, 3);
        
        if (result.success) {
            console.log(`🎉 Success! Completed in ${result.attempts} attempt(s)`);
            console.log(`Final CAPTCHA used: ${result.captcha}`);
            
            if (result.sessionSaved) {
                console.log('💾 Session saved for future use');
            }
            
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
                    console.log('⚠️  Login successful but navigation issue occurred');
                }
            }
        } else {
            console.log('😞 All attempts failed');
        }
        
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await automation.close();
    }
}

// Export for use as module
module.exports = LoginAutomation;

// Run directly if this file is executed
if (require.main === module) {
    runLoginAutomation();
}