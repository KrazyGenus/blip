const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('path');
const { frameInferenceQueue } = require('./queues/frameInferenceQueue');

const FRAMES_DIR = ''
const HASH_THRESHOLD = 5; // Max allowed Hamming distance for a duplicate
const DHASH_WIDTH = 9; // Width or dHash (one more than height for differences)
const DHASH_HEIGHT = 8;

// Store hashes of uniue frames for comparison
const uniqueHashes = new Set(); // Stores BigInt hashes for efficient omparison, a set because the dont allow for duplicate value
const nonDuplicateList = []
let uniqueFrameCount = 0;
let totalFrameCount = 0;

/**
 * 
 * @param {Buffer} imageBuffer - The image data as a Buffer
 * @returns {Promise<bigint>} - The dHash as a BigInt. 
 */
async function getDHashFromBuffer(imageBuffer) {
    try {
        // Use sharp to resie and grayscale the image
        const { data, info } = await sharp(imageBuffer)
            .resize(DHASH_WIDTH, DHASH_HEIGHT)
            .grayscale()
            .raw() // Get raw pixel data(Uint8Array)
            .toBuffer({ resolveWithObject: true });
        if (info.channels !== 1) {
            throw new Error('Image not graysclaed to 1 channel as expected by dHash');
        }
        
        let hash = 0n; // Use BigInt for 64-bit hash
        let bitPosition = 0;

        // Iterate over the  8 rows
        for (let y = 0; y < DHASH_HEIGHT; y++) {
            // Iterate over the 8 comparisons in each row (9 columns, 0 to 8)
            for (let x = 0; x < DHASH_WIDTH - 1; x++) {
                /**
                 * Because even though the image is 2D, the raw pixel data from sharp is returned as a flat 1D array
                 * so simulate 2D, you use math to map:
                 * 2D (x, y) position --> 1D index in Uint8Arrat
                 * The Formula:
                 * index = y * width + x
                 * where:
                 * y = row
                 * x = column
                 * width = number of colums per row(e.g 9 in dHash)
                 */
                const leftPixel = data[y * DHASH_WIDTH + x];
                const rightPixel = data[y * DHASH_WIDTH + (x + 1)];

                // If the right pixel is brigher than the left, set the bit
                if (rightPixel > leftPixel) {
                    hash |= (1n << BigInt(bitPosition));
                }
                bitPosition++;
            }
        }
        return hash;

    } catch (error) {
        console.error('Error proessing image for hahsing.', error);
        throw error;
    }
}


/**
 * Calculates the Hamming distance between two 64-bit BigInt hashes.
 * @param {bigint} hash1 - First hahs. 
 * @param {bigint} hash2 - Second hash.
 * @returns {number} - The Hamming distance.
 */
function hammingDistance(hash1, hash2) {
    let xorResult = hash1 ^ hash2;
    let distance = 0;
    // Count set bits(population count)
    while (xorResult > 0n) {
        xorResult &= (xorResult - 1n); // Brian Kernighan's bit count algorithm
        distance++;
    }
    return distance;
}

/**
 * 
 * @param {string} framePath - Full path to the frame image file. 
 */
async function processFrame(framePath, frameObject) {
    totalFrameCount++;
    try {
        console.log('Frame Object:', frameObject);
        const imageBuffer = await fs.readFile(framePath);
        const currentHash = await getDHashFromBuffer(imageBuffer);

        let isDuplicate = false;
        // Iterate over existing hashes to check Hamming distance
        for (const existingHash of uniqueHashes) {
            const distance = hammingDistance(currentHash, existingHash);
            if (distance <= HASH_THRESHOLD) {
                isDuplicate  = true;
                break;
            }
        }
        if(!isDuplicate) {
            uniqueHashes.add(currentHash);
            nonDuplicateList.push(frameObject);
            console.log('frame object pass', frameObject);
            await frameInferenceQueue.add('inference', frameObject);
            uniqueFrameCount++;
        }
        else {
            console.log(`[Duplicate] Frame: ${path.basename(framePath)}, Hash: ${currentHash.toString(16)}, (skipped)`);
        }
    } catch (error) {
        console.error(`Failed to process frame ${framePath}:`, error);
    }
}

module.exports = { processFrame, nonDuplicateList }