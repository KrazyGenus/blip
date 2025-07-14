const { modelNSFWHuggingFace } = require('../../src/inference/nsfw_detector');


describe('NSFW inference test (integration test)', () => {
    test('should return a JSON containing the confidence socre for NSFW and SFW', async () => {
        const response = await modelNSFWHuggingFace('/home/krazygenus/Desktop/Orgulloso Amante de los Gatos.png');
        expect(response).toBeInstanceOf(Object);
    }, 90000)
})