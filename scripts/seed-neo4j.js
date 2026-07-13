// scripts/seed-neo4j.js
// Run this to add words to Neo4j
// Command: node scripts/seed-neo4j.js

const neo4j = require('neo4j-driver');
require('dotenv').config({ path: '.env.local' });

// ✅ Support both NEO4J_USER and NEO4J_USERNAME
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER || process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  console.error('❌ Neo4j credentials not found in .env.local');
  console.error('   Please ensure NEO4J_URI, NEO4J_USER (or NEO4J_USERNAME), and NEO4J_PASSWORD are set.');
  process.exit(1);
}

console.log('🔍 Using Neo4j URI:', uri);
console.log('🔍 Using Neo4j User:', user);

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