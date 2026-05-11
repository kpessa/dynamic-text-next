const admin = require('firebase-admin');

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
  projectId: 'demo-project'
});

const db = admin.firestore();

async function checkIngredients() {
  try {
    console.log('Fetching ingredients from Firestore...\n');
    
    const ingredientsSnapshot = await db.collection('ingredients').get();
    
    console.log(`Total ingredients: ${ingredientsSnapshot.size}\n`);
    
    // Group ingredients by keyname to check for variants
    const ingredientsByKeyname = new Map();
    
    ingredientsSnapshot.forEach(doc => {
      const data = doc.data();
      const keyname = data.keyname;
      
      if (!ingredientsByKeyname.has(keyname)) {
        ingredientsByKeyname.set(keyname, []);
      }
      ingredientsByKeyname.get(keyname).push({
        id: doc.id,
        ...data
      });
    });
    
    // Show ingredients with variants (same keyname, different versions)
    console.log('Ingredients with variants (same KEYNAME):');
    console.log('==========================================');
    let variantCount = 0;
    
    ingredientsByKeyname.forEach((versions, keyname) => {
      if (versions.length > 1) {
        variantCount++;
        console.log(`\n${keyname} (${versions.length} versions):`);
        versions.forEach(v => {
          console.log(`  - ID: ${v.id}`);
          console.log(`    Population: ${v.populationType || 'N/A'}`);
          console.log(`    Health System: ${v.healthSystem || 'N/A'}`);
          console.log(`    Unit: ${v.unit || 'N/A'}`);
          console.log(`    Sections: ${v.sections ? v.sections.length : 0}`);
        });
      }
    });
    
    if (variantCount === 0) {
      console.log('No ingredients with variants found.\n');
    }
    
    // Show ingredient categories breakdown
    console.log('\n\nIngredients by Category:');
    console.log('========================');
    const categories = {};
    
    ingredientsSnapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    Object.entries(categories).sort().forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    // Show a sample of ingredients to verify structure
    console.log('\n\nSample ingredients (first 5):');
    console.log('==============================');
    
    let count = 0;
    ingredientsSnapshot.forEach(doc => {
      if (count < 5) {
        const data = doc.data();
        console.log(`\n${count + 1}. ${data.keyname} (${doc.id})`);
        console.log(`   Display: ${data.displayName}`);
        console.log(`   Type: ${data.type}`);
        console.log(`   Category: ${data.category}`);
        console.log(`   Unit: ${data.unit}`);
        console.log(`   Population: ${data.populationType || 'N/A'}`);
        console.log(`   Health System: ${data.healthSystem || 'N/A'}`);
        console.log(`   Has Sections: ${data.sections ? 'Yes (' + data.sections.length + ')' : 'No'}`);
        console.log(`   Has Reference Ranges: ${data.referenceRanges ? 'Yes (' + data.referenceRanges.length + ')' : 'No'}`);
        count++;
      }
    });
    
    // Check for any unexpected document IDs
    console.log('\n\nDocument ID patterns:');
    console.log('=====================');
    const idPatterns = new Set();
    
    ingredientsSnapshot.forEach(doc => {
      const parts = doc.id.split('_');
      if (parts.length >= 2) {
        const pattern = parts.slice(0, -1).join('_') + '_[suffix]';
        idPatterns.add(pattern);
      } else {
        idPatterns.add(doc.id);
      }
    });
    
    idPatterns.forEach(pattern => {
      console.log(`  ${pattern}`);
    });
    
  } catch (error) {
    console.error('Error fetching ingredients:', error);
  } finally {
    // Clean up
    await admin.app().delete();
    process.exit(0);
  }
}

checkIngredients();