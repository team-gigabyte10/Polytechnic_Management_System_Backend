const { User } = require('../models');

async function updateUserRole() {
  try {
    // Replace 'your-email@example.com' with your actual email
    const userEmail = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL
    
    // Find the user by email
    const user = await User.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log('❌ User not found with email:', userEmail);
      return;
    }
    
    console.log('👤 Current user info:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Current Role:', user.role);
    console.log('   Is Active:', user.isActive);
    
    // Update role to admin (you can change this to 'teacher' if you prefer)
    const newRole = 'admin'; // or 'teacher'
    
    await user.update({ role: newRole });
    
    console.log('\n✅ User role updated successfully!');
    console.log('   New Role:', newRole);
    console.log('\n🔑 Now you can create courses with this account!');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateUserRole();

