import fs from 'fs/promises';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';

// Fungsi untuk mendapatkan token
async function getToken(initData) {
  const url = "https://tapapi.chaingpt.org/authenticate";
  const headers = {
    'Host': 'tapapi.chaingpt.org',
    'content-type': 'application/json',
    'accept': 'application/json, text/plain, */*',
    'sec-fetch-site': 'same-site',
    'accept-language': "en-US,en;q=0.9",
    'sec-fetch-mode': "cors",
    'origin': "https://play.tap.chaingpt.org",
    'user-agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    'referer': "https://play.tap.chaingpt.org/",
    'sec-fetch-dest': "empty",
    'pragma': "no-cache",
    'cache-control': "no-cache"
  };

  try {
    const response = await axios.post(url, { initData }, { headers });
    return response.data.accessToken;
  } catch (error) {
    console.error(chalk.red.bold("[❌ ERROR] ") + chalk.white("Failed to fetch token:"));
    console.error(chalk.yellow("Details: ") + (error.response ? error.response.data : error.message));
    throw error;
  }
}

// Fungsi untuk melakukan tap dengan token
async function tapWithToken(token) {
  const url = "https://tapapi.chaingpt.org/tap";
  const headers = {
    'Host': 'tapapi.chaingpt.org',
    'content-type': 'application/json',
    'accept': 'application/json, text/plain, */*',
    'authorization': `Bearer ${token}`,
    'sec-fetch-site': "same-site",
    'accept-language': "en-US,en;q=0.9",
    'sec-fetch-mode': "cors",
    'origin': "https://play.tap.chaingpt.org",
    'user-agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    'referer': "https://play.tap.chaingpt.org/",
    'sec-fetch-dest': "empty",
    'pragma': "no-cache",
    'cache-control': "no-cache"
  };

  try {
    const response = await axios.post(url, {
      points: 0x2386f26fc50000,
      taps: 0x2386f26fc50000,
      isTurboMode: true // Turbo Mode diaktifkan di sini
    }, { headers });

    return response.data;
  } catch (error) {
    console.error(chalk.red.bold("[❌ ERROR] ") + chalk.white("Failed to perform tap:"));
    console.error(chalk.yellow("Details: ") + (error.response ? error.response.data : error.message));
    throw error;
  }
}

// Fungsi utama untuk menjalankan tap berulang kali
async function runTapContinuously(filePath) {
  let token;
  try {
    const spinner = ora(chalk.blue('?? Initializing... Please wait')).start();
    const data = await fs.readFile(filePath, 'utf-8');
    const initData = data.split("\n")[0].trim();
    
    token = await getToken(initData);
    spinner.succeed(chalk.green('✔ Token retrieved successfully!'));

    while (true) {
      try {
        const result = await tapWithToken(token);
        console.log(chalk.cyan.bold("\n?? Balance: ") + chalk.green(result.points.toLocaleString()) + " points");
        console.log(chalk.cyan.bold("?? Turbo mode status: ") + (result.isTurboMode ? chalk.green("Enabled") : chalk.red("Disabled")));
      } catch (tapError) {
        console.error(chalk.red.bold("\n[❌ ERROR] ") + chalk.white("Failed in tap request, retrying..."));
        console.error(chalk.yellow("Details: ") + (tapError.response ? tapError.response.data : tapError.message));
      }
    }
  } catch (error) {
    console.error(chalk.red.bold("[❌ ERROR] ") + chalk.white("Initialization failed:"));
    console.error(chalk.yellow("Details: ") + error.message);
  }
}

// Menjalankan fungsi
console.log(chalk.blue.bold("\n?? Processing...! Please wait, it takes 1-3 minutes to run, because the ChainGPT server is very slow."));
runTapContinuously('tgdata.txt').catch(error => {
  console.error(chalk.red.bold("\n[❌ FATAL ERROR] ") + chalk.white("A fatal error occurred:"));
  console.error(chalk.yellow("Details: ") + error.message);
});
