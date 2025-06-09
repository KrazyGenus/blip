const { userRegistration, isExistingEmail, userLogin } = require('../../src/crud/userAuth');
const { databaseManager } = require('../../src/core/database');
require('dotenv').config();



describe('userRegistration (integration test)', () => {
  beforeEach(async () => {
    const pool = databaseManager.getPool();
  });

  it('should register a new user in the real database', async () => {
    const result = await userRegistration('Hasim', 'somethingraw@gmail.com', 'securepassword');
    expect(result.success).toBe(true);
  });

  it('should return false if registered email exist', async() => {
    const result = await userRegistration('Hasim', 'somethingraw@gmail.com', 'somethingrow');
    expect(result.success).toBe(false);
  });
});

describe('isExistingEmail (intergration test)', () =>{
    
    it('should return false if does email exist', async() => {
        const value = await isExistingEmail('bugfix.exe@mgmail.com');
        expect(value.success).toBe(false);
    });

    it('should return true if email exists', async() => {
        const value = await isExistingEmail('comeandeatbeans@gmail.com');
        expect(value.success).toBe(true);
    });
} );


describe('userLogin (integration test)', () => {
    // testing for a correct useremail and password
    it('should return true if login was successful', async () => {
        const value = await userLogin('somethingraw@gmail.com', 'securepassword');
        expect(value.success).toBe(true);
    });

    it('should return false if login was ! successful', async () => {
        // testing with a non existing user and email
        const value = await userLogin('somethingraw@outlook.com', 'securepassword');
        expect(value.success).toBe(false);
    });


    it('should return false if login was ! successful', async () => {
        // testing with a wrong password but correct email in the db
        const value = await userLogin('somethingraw@gmail.com', 'runlikethewind');
        expect(value.success).toBe(false);
    });
});