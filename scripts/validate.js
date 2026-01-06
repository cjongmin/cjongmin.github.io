const { loadInfo } = require('./dist/lib/loadInfo.js');

try {
    console.log('Validating /data/info.json...\n');
    loadInfo();
    console.log('✅ Validation successful! Your info.json is valid.\n');
    process.exit(0);
} catch (error) {
    // Error already printed by loadInfo()
    process.exit(1);
}
