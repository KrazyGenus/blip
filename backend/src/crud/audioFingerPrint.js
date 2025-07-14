const { exec } = require('child_process');
const util = require('util');
const axios = require('axios')

// Promisify util enabling await on sub process or child process
const execPromise = util.promisify(exec);
async function getFingerprint(audioPath) {
    try {
        const { stdout, stderr } = await execPromise(`fpcalc ${audioPath}`);
        const rawSample = stdout.split('\n');
        
        let DURATION, FINGERPRINT;

        for (const line of rawSample) {
            if (line.startsWith('DURATION=')) {
                DURATION = line.split('=')[1];
            } else if (line.startsWith('FINGERPRINT=')) {
                FINGERPRINT = line.split('=')[1];
            }
        }
        console.log('Duration is:',DURATION);
        console.log('FingerPrint is:',FINGERPRINT);
        console.log('Sending Request to AcoustId');
        getFingerPrintValidity(DURATION, FINGERPRINT);
    } catch (error) {
        console.log('An error occured during fingerprinting', error);
    }
}

async function getFingerPrintValidity(duration, fingerPrint) {
    const CLIENT = 'X0d7iUFGaa';
    try {
        const responseAcoustId = await axios.post(`https://api.acoustid.org/v2/lookup?client=${CLIENT}&meta=recordings+releasegroups+compress&duration=${duration}&fingerprint=${fingerPrint}`);
        console.log('AcoustId response: ', responseAcoustId.data);
    } catch (error) {
        console.log('Error occured when transmitting fingerprint to AcoustId', error);
    }
}


(async () => {
    const result = await getFingerprint('/home/krazygenus/Desktop/blip/backend/src/audio/user_9/2005dfb9-01d4-48f1-b765-672aaf9eeaef/audio_9_Kendrick_Lamar_-_Not_Like_Us.wav');
})();