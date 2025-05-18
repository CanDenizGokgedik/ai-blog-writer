const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Reset monthly post count for all users on the first day of each month
exports.resetMonthlyPostCounts = functions.pubsub
  .schedule('0 0 1 * *') // Run at 00:00 on the 1st of every month
  .timeZone('UTC')
  .onRun(async (context) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    
    const batch = db.batch();
    
    usersSnapshot.forEach((doc) => {
      batch.update(doc.ref, { postsThisMonth: 0 });
    });
    
    await batch.commit();
    
    console.log(`Reset monthly post count for ${usersSnapshot.size} users`);
    return null;
  });

// Cloud Function to update user's plan at the end of the billing period
exports.processSubscriptionRenewals = functions.pubsub
  .schedule('0 0 * * *') // Run daily at midnight
  .timeZone('UTC')
  .onRun(async (context) => {
    // In a real implementation, this would check against a payment processor
    // For this example, we're just logging it
    console.log('Processing subscription renewals (placeholder)');
    return null;
  }); 