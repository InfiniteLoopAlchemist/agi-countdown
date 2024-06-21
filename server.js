const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const express = require('express');

// Function to take screenshot with retry mechanism
/**
 * Takes a screenshot of a specific portion of a webpage. can take a few min to complete
 * @param {number} [attempt=1] - The current attempt number. Defaults to 1.
 * @return {Promise<void>} - Resolves when the screenshot is taken successfully or when maximum retry attempts are reached.
 */
async function takeScreenshot( attempt = 1 ) {
    console.log(`Attempt ${ attempt } to take screenshot`);
    
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Navigate to the website
        console.log('Navigating to website...');
        await page.goto('https://lifearchitect.ai/agi/');
        
        // Wait for the animation to finish
        console.log('Waiting for animation to finish...');
        await page.waitForSelector('#canvas-gauge');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds
        
        // Get the bounding box of the div containing the canvas
        const element = await page.$('div[style*="text-align: center;"]');
        const boundingBox = await element.boundingBox();
        
        // Define the path for the screenshot
        const screenshotPath = path.join(__dirname, 'screenshot.png');
        
        // Take the screenshot
        console.log('Taking screenshot...');
        await page.screenshot({
            path: screenshotPath,
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height
            }
        });
        
        await browser.close();
        console.log('Screenshot taken successfully');
    } catch ( error ) {
        console.error(`Failed to take screenshot on attempt ${ attempt }:`, error);
        if ( attempt < 5 ) {
            console.log('Retrying in 15 minutes...');
            setTimeout(() => takeScreenshot(attempt + 1), 15 * 60 * 1000); // Retry after 15 minutes
        } else {
            console.error('Max retry attempts reached. Failed to take screenshot.');
        }
    }
}

// Schedule the task to run at 12 PM and 6 PM
cron.schedule('0 12,18 * * *', () => {
    console.log('Scheduled task started');
    takeScreenshot().catch(error => console.error('Error in scheduled task:', error));
});

// Set up the Express server to serve the screenshot
const app = express();
const PORT = 3000;

app.get('/agi-countdown', ( req, res ) => {
    const screenshotPath = path.join(__dirname, 'screenshot.png');
    if ( fs.existsSync(screenshotPath) ) {
        res.sendFile(screenshotPath);
    } else {
        res.status(404).send('Screenshot not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${ PORT }`);
});

// Take an initial screenshot on startup can take a few min to complete
takeScreenshot().catch(error => console.error('Error in initial screenshot:', error));
