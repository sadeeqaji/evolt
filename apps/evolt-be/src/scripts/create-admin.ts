import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../user/user.model.js'; //

// Load environment variables
dotenv.config();

/**
 * =======================================================
 * SCRIPT CONFIGURATION
 * =======================================================
 */
const USER_DETAILS = {
  email: 'admin@evolt.com',
  password: 'AdminPassword123!', // Change this to a secure password
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin', // Set role to 'admin'
  accountType: 'business', // Can be 'investor' or 'business'
};
/**
 * =======================================================
 */

const createAdminUser = async () => {
  const { email, password, firstName, lastName, role, accountType } =
    USER_DETAILS;

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set in .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ MongoDB connected...');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email }); //
    if (existingAdmin) {
      console.warn(`⚠️ User ${email} already exists.`);
      return;
    }

    // Create the new admin user
    const adminUser = new UserModel({
      firstName,
      lastName,
      email,
      password, // Password will be hashed by the pre-save hook
      role,
      accountType,
      isVerified: true, // Mark as verified to skip OTP
      onboardingStep: 'password_set', // Mark as fully onboarded
      passwordUpdatedAt: new Date(),
    });

    await adminUser.save(); //

    console.log('\n===================================');
    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('===================================\n');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
};

createAdminUser();
