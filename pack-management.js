// const fs = require('fs');
// const path = require('path');

// class PackManagementAutomation {
//     constructor(page) {
//         this.page = page;
//         this.vcNumber = 'T403221167147';
//     }

//     async waitForElement(selector, timeout = 10000) {
//         try {
//             await this.page.waitForSelector(selector, { timeout });
//             return true;
//         } catch (error) {
//             console.error(`❌ Element not found: ${selector}`);
//             return false;
//         }
//     }

//     async checkPage() {
//         try {
//             const currentUrl = this.page.url();
//             console.log(`📍 Current URL: ${currentUrl}`);
            
//             // Check if we're on the right page
//             if (!currentUrl.includes('frmAssignPlan.aspx')) {
//                 console.log('⚠️ Not on Pack Management page');
//                 return false;
//             }
            
//             // Check if there's a login form (session expired)
//             const hasLoginForm = await this.page.evaluate(() => {
//                 return document.querySelector('#txtUsername, input[name*="user"]') !== null;
//             });
            
//             if (hasLoginForm) {
//                 console.log('⚠️ Session expired - redirected to login');
//                 return false;
//             }
            
//             console.log('✅ On Pack Management page with valid session');
//             return true;
            
//         } catch (error) {
//             console.error('❌ Error checking page:', error.message);
//             return false;
//         }
//     }

//     async searchVCNumber(vcNumber) {
//         console.log(`🔍 Searching for VC Number: ${vcNumber}`);
        
//         try {
//             // First, verify we're on the right page
//             const isCorrectPage = await this.checkPage();
//             if (!isCorrectPage) {
//                 console.log('❌ Not on Pack Management page');
//                 return false;
//             }
            
//             // Take screenshot before search
//             await this.page.screenshot({ path: 'before_search.png' });
            
//             // Find the search input - these are specific to the Pack Management page
//             const searchSelectors = [
//                 // Specific selectors for Pack Management page
//                 'input[placeholder*="Search"]',
//                 'input[class*="txtSearch"]',
//                 'input[id*="txtSearch"]',
//                 'input[name*="txtSearch"]',
//                 'input[type="text"][class*="search"]',
//                 // Looking for the search input near "Search By"
//                 'input[type="text"]:not([readonly])',
//                 'input[type="text"]'
//             ];
            
//             let searchInput = null;
//             for (const selector of searchSelectors) {
//                 try {
//                     const elements = await this.page.$$(selector);
//                     if (elements && elements.length > 0) {
//                         // Find the visible one that's not on login page
//                         for (const element of elements) {
//                             const isVisible = await element.isVisible();
//                             if (isVisible) {
//                                 // Make sure this is not the username field
//                                 const id = await element.getAttribute('id');
//                                 const name = await element.getAttribute('name');
//                                 if (id !== 'txtUsername' && name !== 'txtUsername') {
//                                     searchInput = element;
//                                     console.log(`✅ Found search input using: ${selector}`);
//                                     break;
//                                 }
//                             }
//                         }
//                         if (searchInput) break;
//                     }
//                 } catch (e) {}
//             }
            
//             if (!searchInput) {
//                 console.log('❌ Search input not found');
//                 await this.page.screenshot({ path: 'search_input_not_found.png' });
//                 return false;
//             }
            
//             // Clear and fill the VC number
//             await searchInput.click();
//             await searchInput.fill('');
//             await searchInput.fill(vcNumber);
//             console.log(`✅ Entered VC Number: ${vcNumber}`);
            
//             await this.page.waitForTimeout(1000);
            
//             // Find and click search button
//             const searchButtonSelectors = [
//                 'button:has-text("Search")',
//                 'input[value="Search"]',
//                 'button[type="submit"]:has-text("Search")',
//                 'button[class*="btnSearch"]',
//                 'input[class*="btnSearch"]',
//                 'button[id*="btnSearch"]',
//                 'input[id*="btnSearch"]'
//             ];
            
//             let searchButton = null;
//             for (const selector of searchButtonSelectors) {
//                 try {
//                     const element = await this.page.$(selector);
//                     if (element && await element.isVisible()) {
//                         searchButton = element;
//                         console.log(`✅ Found search button using: ${selector}`);
//                         break;
//                     }
//                 } catch (e) {}
//             }
            
//             if (!searchButton) {
//                 console.log('⚠️ Search button not found, pressing Enter');
//                 await this.page.keyboard.press('Enter');
//             } else {
//                 await searchButton.click();
//             }
            
//             console.log('✅ Search submitted');
            
//             // Wait for results to load
//             await this.page.waitForTimeout(5000);
//             await this.page.screenshot({ path: 'after_search.png' });
            
//             return true;
            
//         } catch (error) {
//             console.error('❌ Error searching VC Number:', error.message);
//             await this.page.screenshot({ path: 'search_error.png' });
//             return false;
//         }
//     }

//     async clickMainTV() {
//         console.log('🖱️ Clicking on Main TV...');
        
//         try {
//             // Wait for search results to load
//             await this.page.waitForTimeout(2000);
            
//             // Look for Main TV link/button in the results
//             const mainTVSelectors = [
//                 'a:has-text("Main TV")',
//                 'button:has-text("Main TV")',
//                 'span:has-text("Main TV")',
//                 'div:has-text("Main TV")',
//                 'a[href*="MainTV"]',
//                 'td:has-text("Main TV")',
//                 'tr:has-text("Main TV")'
//             ];
            
//             let clicked = false;
//             for (const selector of mainTVSelectors) {
//                 try {
//                     const element = await this.page.$(selector);
//                     if (element && await element.isVisible()) {
//                         await element.click();
//                         clicked = true;
//                         console.log(`✅ Clicked Main TV using: ${selector}`);
//                         break;
//                     }
//                 } catch (e) {}
//             }
            
//             // If not found by text, try to find by looking for the VC number
//             if (!clicked) {
//                 console.log('⚠️ Main TV not found by text, looking for VC number row...');
                
//                 // Look for the row containing the VC number
//                 const vcElement = await this.page.$(`td:has-text("${this.vcNumber}"), span:has-text("${this.vcNumber}")`);
//                 if (vcElement) {
//                     // Click the Main TV link in that row
//                     const row = await vcElement.evaluateHandle(el => el.closest('tr'));
//                     if (row) {
//                         const mainTVLink = await row.$('a:has-text("Main TV"), button:has-text("Main TV")');
//                         if (mainTVLink) {
//                             await mainTVLink.click();
//                             clicked = true;
//                             console.log('✅ Clicked Main TV from the VC number row');
//                         }
//                     }
//                 }
//             }
            
//             // If still not found, try clicking any "Main TV" in the table
//             if (!clicked) {
//                 const mainTVElements = await this.page.$$('td:has-text("Main TV"), div:has-text("Main TV")');
//                 for (const element of mainTVElements) {
//                     if (await element.isVisible()) {
//                         await element.click();
//                         clicked = true;
//                         console.log('✅ Clicked Main TV from table');
//                         break;
//                     }
//                 }
//             }
            
//             if (!clicked) {
//                 console.log('❌ Could not find Main TV');
//                 await this.page.screenshot({ path: 'main_tv_not_found.png' });
//                 return false;
//             }
            
//             await this.page.waitForTimeout(3000);
//             await this.page.screenshot({ path: 'after_main_tv_click.png' });
//             return true;
            
//         } catch (error) {
//             console.error('❌ Error clicking Main TV:', error.message);
//             await this.page.screenshot({ path: 'main_tv_error.png' });
//             return false;
//         }
//     }

//     async clickActionArrow() {
//         console.log('▶️ Clicking Action arrow...');
        
//         try {
//             // Wait for Main TV details to load
//             await this.page.waitForTimeout(2000);
            
//             // Look for the action arrow/button
//             const actionSelectors = [
//                 'button[class*="action"]',
//                 'a[class*="action"]',
//                 'i[class*="fa-chevron-down"]',
//                 'i[class*="arrow"]',
//                 'span[class*="action"]',
//                 'td:has-text("Action")',
//                 'button:has-text("▼")',
//                 'button:has-text("Action")',
//                 'a:has-text("▶")',
//                 'div[class*="dropdown"] button'
//             ];
            
//             let clicked = false;
//             for (const selector of actionSelectors) {
//                 try {
//                     const element = await this.page.$(selector);
//                     if (element && await element.isVisible()) {
//                         await element.click();
//                         clicked = true;
//                         console.log(`✅ Clicked Action using: ${selector}`);
//                         break;
//                     }
//                 } catch (e) {}
//             }
            
//             // If not found, look for the action in the row
//             if (!clicked) {
//                 console.log('⚠️ Action button not found, looking in row...');
                
//                 const vcElement = await this.page.$(`td:has-text("${this.vcNumber}")`);
//                 if (vcElement) {
//                     const row = await vcElement.evaluateHandle(el => el.closest('tr'));
//                     if (row) {
//                         const actionButton = await row.$('td:last-child button, td:last-child a, td:has-text("Action")');
//                         if (actionButton) {
//                             await actionButton.click();
//                             clicked = true;
//                             console.log('✅ Clicked Action from row');
//                         }
//                     }
//                 }
//             }
            
//             if (!clicked) {
//                 // Try looking for dropdown icons
//                 const dropdownIcons = await this.page.$$('i.fa-chevron-down, i.fa-angle-down, i.fa-caret-down, span[class*="caret"]');
//                 for (const icon of dropdownIcons) {
//                     if (await icon.isVisible()) {
//                         await icon.click();
//                         clicked = true;
//                         console.log('✅ Clicked dropdown icon');
//                         break;
//                     }
//                 }
//             }
            
//             if (!clicked) {
//                 console.log('❌ Action arrow not found');
//                 await this.page.screenshot({ path: 'action_not_found.png' });
//                 return false;
//             }
            
//             // Wait for dropdown menu to appear
//             await this.page.waitForTimeout(2000);
//             await this.page.screenshot({ path: 'after_action_click.png' });
//             return true;
            
//         } catch (error) {
//             console.error('❌ Error clicking Action arrow:', error.message);
//             await this.page.screenshot({ path: 'action_error.png' });
//             return false;
//         }
//     }

//     async clickRenewOption() {
//         console.log('🔄 Clicking Renew option...');
        
//         try {
//             // Wait for dropdown menu to be visible
//             await this.page.waitForTimeout(1000);
            
//             // Look for Renew option in dropdown
//             const renewSelectors = [
//                 'a:has-text("Renew")',
//                 'button:has-text("Renew")',
//                 'span:has-text("Renew")',
//                 'li:has-text("Renew")',
//                 'div:has-text("Renew")',
//                 'a[href*="Renew"]',
//                 'button[class*="renew"]',
//                 'a[class*="renew"]'
//             ];
            
//             let clicked = false;
//             for (const selector of renewSelectors) {
//                 try {
//                     const element = await this.page.$(selector);
//                     if (element && await element.isVisible()) {
//                         await element.click();
//                         clicked = true;
//                         console.log(`✅ Clicked Renew using: ${selector}`);
//                         break;
//                     }
//                 } catch (e) {}
//             }
            
//             if (!clicked) {
//                 console.log('⚠️ Renew option not found, looking in dropdown menu...');
                
//                 // Try to find in dropdown menu items
//                 const menuItems = await this.page.$$('ul.dropdown-menu li a, ul[class*="dropdown"] li a, .dropdown-menu a');
//                 for (const item of menuItems) {
//                     try {
//                         const text = await item.textContent();
//                         if (text && text.toLowerCase().includes('renew')) {
//                             await item.click();
//                             clicked = true;
//                             console.log('✅ Clicked Renew from dropdown menu');
//                             break;
//                         }
//                     } catch (e) {}
//                 }
//             }
            
//             if (!clicked) {
//                 console.log('❌ Renew option not found');
//                 await this.page.screenshot({ path: 'renew_not_found.png' });
//                 return false;
//             }
            
//             await this.page.waitForTimeout(3000);
//             await this.page.screenshot({ path: 'after_renew_click.png' });
//             console.log('✅ Renew clicked successfully');
//             return true;
            
//         } catch (error) {
//             console.error('❌ Error clicking Renew:', error.message);
//             await this.page.screenshot({ path: 'renew_error.png' });
//             return false;
//         }
//     }

//     async performFullRenewal(vcNumber = this.vcNumber) {
//         console.log('\n🔄 Starting Full Renewal Process...');
//         console.log('='.repeat(60));
        
//         try {
//             // Step 1: Verify we're on Pack Management page
//             const isCorrectPage = await this.checkPage();
//             if (!isCorrectPage) {
//                 console.log('❌ Not on Pack Management page. Please navigate there first.');
//                 return false;
//             }
            
//             // Step 2: Search for VC Number
//             const searchResult = await this.searchVCNumber(vcNumber);
//             if (!searchResult) {
//                 console.log('❌ Failed to search VC Number');
//                 return false;
//             }
            
//             // Step 3: Click Main TV
//             const mainTVResult = await this.clickMainTV();
//             if (!mainTVResult) {
//                 console.log('❌ Failed to click Main TV');
//                 return false;
//             }
            
//             // Step 4: Click Action Arrow
//             const actionResult = await this.clickActionArrow();
//             if (!actionResult) {
//                 console.log('❌ Failed to click Action arrow');
//                 return false;
//             }
            
//             // Step 5: Click Renew
//             const renewResult = await this.clickRenewOption();
//             if (!renewResult) {
//                 console.log('❌ Failed to click Renew');
//                 return false;
//             }
            
//             console.log('\n✅ Renewal Process Completed Successfully!');
//             console.log('='.repeat(60));
//             return true;
            
//         } catch (error) {
//             console.error('❌ Error in renewal process:', error.message);
//             return false;
//         }
//     }

//     async getCustomerDetails() {
//         try {
//             console.log('📋 Getting customer details...');
            
//             const details = await this.page.evaluate(() => {
//                 const data = {};
                
//                 // Get customer name
//                 const nameElement = document.querySelector('td:has-text("Customer Name") + td, div:has-text("Customer Name") + div');
//                 if (nameElement) {
//                     data.customerName = nameElement.textContent.trim();
//                 }
                
//                 // Get account number
//                 const accountElement = document.querySelector('td:has-text("Customer A/C No.") + td');
//                 if (accountElement) {
//                     data.accountNo = accountElement.textContent.trim();
//                 }
                
//                 // Get mobile number
//                 const mobileElement = document.querySelector('td:has-text("Customer Mobile") + td');
//                 if (mobileElement) {
//                     data.mobile = mobileElement.textContent.trim();
//                 }
                
//                 return data;
//             });
            
//             console.log('📊 Customer Details:', details);
//             return details;
            
//         } catch (error) {
//             console.error('❌ Error getting customer details:', error.message);
//             return null;
//         }
//     }
// }

// module.exports = PackManagementAutomation;


const fs = require('fs');
const path = require('path');

class PackManagementAutomation {
    constructor(page) {
        this.page = page;
        this.vcNumber = 'T403221167147';
    }

    async checkPage() {
        try {
            const currentUrl = this.page.url();
            console.log(`📍 Current URL: ${currentUrl}`);

            if (!currentUrl.includes('frmAssignPlan.aspx')) {
                console.log('⚠️ Not on Pack Management page');
                return false;
            }

            const hasLoginForm = await this.page.evaluate(() => {
                return document.querySelector('#txtUsername, input[name*="user"]') !== null;
            });

            if (hasLoginForm) {
                console.log('⚠️ Session expired - redirected to login');
                return false;
            }

            console.log('✅ On Pack Management page with valid session');
            return true;

        } catch (error) {
            console.error('❌ Error checking page:', error.message);
            return false;
        }
    }

    async searchVCNumber(vcNumber) {
        console.log(`🔍 Searching for VC Number: ${vcNumber}`);

        try {
            const isCorrectPage = await this.checkPage();
            if (!isCorrectPage) {
                console.log('❌ Not on Pack Management page');
                return false;
            }

            let searchInput = await this.page.$('#txtSearch, input[id*="txtSearch"], input[class*="txtSearch"]');
            if (!searchInput) {
                searchInput = await this.page.$('input[type="text"]');
            }

            if (!searchInput) {
                console.log('❌ Search input not found');
                await this.page.screenshot({ path: 'search_input_not_found.png' });
                return false;
            }

            await searchInput.click();
            await searchInput.fill('');
            await searchInput.fill(vcNumber);
            console.log(`✅ Entered VC Number: ${vcNumber}`);

            await this.page.waitForTimeout(1000);

            let searchButton = await this.page.$('button:has-text("Search"), input[value="Search"]');
            if (searchButton) {
                await searchButton.click();
            } else {
                await this.page.keyboard.press('Enter');
            }

            console.log('✅ Search submitted');
            await this.page.waitForTimeout(5000);
            await this.page.screenshot({ path: 'after_search.png' });

            return true;

        } catch (error) {
            console.error('❌ Error searching VC Number:', error.message);
            return false;
        }
    }

    async clickMainTV() {
        console.log('🖱️ Clicking on Main TV...');

        try {
            await this.page.waitForTimeout(2000);

            let mainTV = await this.page.$('a:has-text("Main TV")');
            if (!mainTV) {
                mainTV = await this.page.$('span:has-text("Main TV")');
            }
            if (!mainTV) {
                mainTV = await this.page.$('td:has-text("Main TV")');
            }

            if (mainTV) {
                await mainTV.click();
                console.log('✅ Clicked Main TV');
                await this.page.waitForTimeout(3000);
                await this.page.screenshot({ path: 'after_main_tv.png' });
                return true;
            }

            console.log('❌ Main TV not found');
            await this.page.screenshot({ path: 'main_tv_not_found.png' });
            return false;

        } catch (error) {
            console.error('❌ Error clicking Main TV:', error.message);
            return false;
        }
    }

    /**
     * Finds the "Plan Details" table, locates the Action column by reading
     * the header row (so it doesn't matter what order columns are in), then
     * marks the matching data row with a temporary attribute so a real
     * Playwright locator (not a synthetic evaluate-click) can click the
     * arrow inside it.
     *
     * planNameFilter (optional) lets you target a specific plan row when
     * there is more than one plan listed for the same customer. If omitted,
     * the first data row is used.
     */
    async clickActionArrow(planNameFilter = null) {
        console.log('▶️ Clicking V-shaped arrow in Action column...');

        try {
            await this.page.waitForTimeout(1500);

            // 1) Read-only pass: find the table/row/column, mark the row.
            const target = await this.page.evaluate((planNameFilter) => {
                // clear any stale markers from previous runs
                document.querySelectorAll('[data-automation-target-row]')
                    .forEach(r => r.removeAttribute('data-automation-target-row'));

                const tables = document.querySelectorAll('table');

                for (let t = 0; t < tables.length; t++) {
                    const table = tables[t];
                    const headerRow = table.querySelector('tr');
                    if (!headerRow) continue;

                    const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
                    const actionIdx = headerCells.findIndex(
                        c => (c.textContent || '').trim().toLowerCase() === 'action'
                    );
                    if (actionIdx === -1) continue; // not the right table

                    const rows = Array.from(table.querySelectorAll('tr')).slice(1); // skip header
                    for (let r = 0; r < rows.length; r++) {
                        const cells = rows[r].querySelectorAll('td');
                        if (cells.length <= actionIdx) continue;

                        if (planNameFilter) {
                            const rowText = rows[r].textContent || '';
                            if (!rowText.includes(planNameFilter)) continue;
                        }

                        rows[r].setAttribute('data-automation-target-row', 'true');
                        return {
                            found: true,
                            actionIdx,
                            cellHtmlPreview: cells[actionIdx].innerHTML.slice(0, 150)
                        };
                    }
                }

                return { found: false };
            }, planNameFilter);

            if (!target.found) {
                console.log('❌ Could not find the Action column / matching row');
                await this.page.screenshot({ path: 'arrow_not_found.png' });
                return false;
            }

            console.log(`   Located Action cell (index ${target.actionIdx}): ${target.cellHtmlPreview}`);

            // 2) Real Playwright click on the marked row's Action cell.
            const actionCell = this.page
                .locator('tr[data-automation-target-row="true"] td')
                .nth(target.actionIdx);

            await actionCell.scrollIntoViewIfNeeded();

            // Prefer clicking an inner icon/link/button if one exists, else the cell itself.
            const innerClickable = actionCell.locator('img, svg, i, span, a, button').first();
            if (await innerClickable.count() > 0) {
                await innerClickable.click({ force: true });
            } else {
                await actionCell.click({ force: true });
            }

            console.log('✅ V-shaped arrow clicked');
            await this.page.waitForTimeout(2000);
            await this.page.screenshot({ path: 'after_action_click.png' });

            // Sanity check: did a dropdown actually open?
            const dropdownVisible = await this.page.evaluate(() => {
                const menus = document.querySelectorAll('.dropdown-menu, [class*="dropdown-menu"]');
                for (const menu of menus) {
                    const style = window.getComputedStyle(menu);
                    const rect = menu.getBoundingClientRect();
                    if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) {
                        return true;
                    }
                }
                return false;
            });

            if (!dropdownVisible) {
                console.log('⚠️ Dropdown did not appear after click — retrying with a direct DOM click as fallback');
                await this.page.evaluate(() => {
                    const row = document.querySelector('tr[data-automation-target-row="true"]');
                    if (!row) return;
                    const cells = row.querySelectorAll('td');
                    const lastCell = cells[cells.length - 1];
                    const el = lastCell.querySelector('img, svg, i, span, a, button') || lastCell;
                    el.click();
                });
                await this.page.waitForTimeout(1500);
                await this.page.screenshot({ path: 'after_action_click_retry.png' });
            }

            return true;

        } catch (error) {
            console.error('❌ Error clicking Action arrow:', error.message);
            await this.page.screenshot({ path: 'action_error.png' });
            return false;
        } finally {
            // Clean up the marker so it doesn't interfere with later steps.
            await this.page.evaluate(() => {
                document.querySelectorAll('[data-automation-target-row]')
                    .forEach(r => r.removeAttribute('data-automation-target-row'));
            }).catch(() => {});
        }
    }

    async clickRenewOption() {
        console.log('🔄 Clicking RENEW from dropdown...');

        try {
            // Wait for a visible dropdown menu to show up.
            const dropdown = this.page.locator('.dropdown-menu, [class*="dropdown-menu"]').first();
            await dropdown.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
                console.log('⚠️ No dropdown became visible within timeout, will still try to locate RENEW');
            });

            // Match an exact "RENEW" text (case-insensitive), inside any visible dropdown.
            const renewOption = this.page
                .locator('.dropdown-menu li, [class*="dropdown-menu"] li, .dropdown-menu a, [class*="dropdown-menu"] a, .dropdown-menu button, [class*="dropdown-menu"] button')
                .filter({ hasText: /^\s*renew\s*$/i });

            const count = await renewOption.count();
            if (count === 0) {
                console.log('❌ RENEW option not found in dropdown');
                await this.page.screenshot({ path: 'renew_not_found.png' });
                return false;
            }

            await renewOption.first().click({ force: true });

            console.log('✅ RENEW clicked');
            await this.page.waitForTimeout(3000);
            await this.page.screenshot({ path: 'after_renew_click.png' });

            return true;

        } catch (error) {
            console.error('❌ Error clicking RENEW:', error.message);
            await this.page.screenshot({ path: 'renew_error.png' });
            return false;
        }
    }

            async clickConfirmPopup() {
        console.log('✅ Clicking CONFIRM on first popup...');

        try {
            const confirmButton = this.page
                .locator('button, a, span, input[type="button"], input[type="submit"]')
                .filter({ hasText: /^\s*confirm\s*$/i });

            // Wait for it to actually become VISIBLE (not just present in DOM)
            await confirmButton.first().waitFor({ state: 'visible', timeout: 10000 });
            await confirmButton.first().click();

            console.log('✅ Confirm clicked');

            // This triggers an ASP.NET postback (WebForm_DoPostBackWithOptions) —
            // wait for the page to settle before looking for the next popup
            await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
                console.log('⚠️ networkidle wait timed out, continuing anyway');
            });
            await this.page.waitForTimeout(1500);
            await this.page.screenshot({ path: 'after_confirm_click.png' });

            return true;

        } catch (error) {
            console.error('❌ Error clicking Confirm:', error.message);
            await this.page.screenshot({ path: 'confirm_error.png' });
            return false;
        }
    }

        async clickYesPopup() {
        console.log('✅ Clicking YES on second popup...');

        try {
            // Wait for the SECOND confirmation modal specifically —
            // it has distinct text "Are you sure you want to renew the plan"
            // (no question mark, no "with following details"), so we can
            // wait for that exact modal to appear rather than the first one.
            const secondModalText = this.page.locator('text=/Are you sure you want to renew the plan/i');
            await secondModalText.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
                console.log('⚠️ Distinct second-modal text not found, falling back to generic Yes search');
            });

            const yesButton = this.page
                .locator('button:visible, a:visible, span:visible, input[type="button"]:visible, input[type="submit"]:visible')
                .filter({ hasText: /^\s*yes\s*$/i });

            await yesButton.first().waitFor({ state: 'visible', timeout: 15000 });

            const outerHtml = await yesButton.first().evaluate(el => el.outerHTML).catch(() => 'n/a');
            console.log(`   Yes element resolved to: ${outerHtml}`);

            await yesButton.first().click();

            console.log('✅ Yes clicked');

            await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
                console.log('⚠️ networkidle wait timed out, continuing anyway');
            });
            await this.page.waitForTimeout(1500);
            await this.page.screenshot({ path: 'after_yes_click.png' });

            return true;

        } catch (error) {
            console.error('❌ Error clicking Yes:', error.message);
            await this.page.screenshot({ path: 'yes_error.png' });
            return false;
        }
    }

    async performFullRenewal(vcNumber = this.vcNumber, planNameFilter = null) {
        console.log('\n🔄 Starting Full Renewal Process...');
        console.log('='.repeat(60));

        try {
            const isCorrectPage = await this.checkPage();
            if (!isCorrectPage) {
                console.log('❌ Not on Pack Management page');
                return false;
            }

            const searchResult = await this.searchVCNumber(vcNumber);
            if (!searchResult) {
                console.log('❌ Failed to search VC Number');
                return false;
            }

            const mainTVResult = await this.clickMainTV();
            if (!mainTVResult) {
                console.log('❌ Failed to click Main TV');
                return false;
            }

            const actionResult = await this.clickActionArrow(planNameFilter);
            if (!actionResult) {
                console.log('❌ Failed to click Action arrow');
                return false;
            }

            // const renewResult = await this.clickRenewOption();
            // if (!renewResult) {
            //     console.log('❌ Failed to click RENEW');
            //     return false;
            // }

            // console.log('\n✅ Renewal Process Completed Successfully!');
                        const renewResult = await this.clickRenewOption();
            if (!renewResult) {
                console.log('❌ Failed to click RENEW');
                return false;
            }

            const confirmResult = await this.clickConfirmPopup();
            if (!confirmResult) {
                console.log('❌ Failed to click Confirm');
                return false;
            }

            const okResult = await this.clickYesPopup();
            if (!yesResult) {
                console.log('❌ Failed to click yes');
                return false;
            }

            console.log('\n✅ Renewal Process Completed Successfully!');
            console.log('='.repeat(60));
            return true;

        } catch (error) {
            console.error('❌ Error in renewal process:', error.message);
            return false;
        }
    }
}

module.exports = PackManagementAutomation;
