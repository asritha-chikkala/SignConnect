// scripts/seed-neo4j.js
// Run this to add words to Neo4j
// Command: node scripts/seed-neo4j.js

const neo4j = require('neo4j-driver');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  console.error('❌ Neo4j credentials not found in .env.local');
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// ISL words to seed
const words = [
  'hello', 'help', 'hospital', 'thank', 'you', 
  'happy', 'danger', 'emergency', 'please', 'sorry',
  'goodbye', 'how', 'what', 'where', 'why', 'who',
  'yes', 'no', 'love', 'sad', 'angry', 'scared'
];

async function seed() {
  console.log('🔄 Seeding Neo4j with ISL words...');
  const session = driver.session();
  
  try {
    for (const word of words) {
      await session.run(
        'MERGE (w:Word {token: $token}) ON CREATE SET w.created = datetime()',
        { token: word }
      );
      console.log(`  ✅ Added: ${word}`);
    }
    
    // Add some relationships (semantic closeness)
    await session.run(`
      MATCH (a:Word {token: 'hello'})
      MATCH (b:Word {token: 'hi'})
      MERGE (a)-[:CLOSE_TO]->(b)
    `);
    
    await session.run(`
      MATCH (a:Word {token: 'help'})
      MATCH (b:Word {token: 'assist'})
      MERGE (a)-[:CLOSE_TO]->(b)
    `);
    
    console.log('✅ Neo4j seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();