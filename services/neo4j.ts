import neo4j from "neo4j-driver";

let driver: any = null;

function getDriver() {
  if (driver) return driver;
  
  if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
    return null;
  }
  
  driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );
  return driver;
}

// ✅ Existing function - keep this
export async function findNearestSemanticWord(word: string): Promise<string | null> {
  const driverInstance = getDriver();
  if (!driverInstance) return null;
  
  const session = driverInstance.session();
  try {
    const result = await session.run(
      "MATCH (w:Word {token: $word})-[:CLOSE_TO]->(n:Word) RETURN n.token AS token LIMIT 1",
      { word },
    );
    return result.records[0]?.get("token") ?? null;
  } finally {
    await session.close();
  }
}

// ✅ NEW: Simple function to get a single sign
export async function getSignFromNeo4j(word: string): Promise<string | null> {
  const driverInstance = getDriver();
  if (!driverInstance) return null;
  
  const session = driverInstance.session();
  try {
    const result = await session.run(
      "MATCH (w:Word {token: $word}) RETURN w.token AS token",
      { word: word.toLowerCase() },
    );
    return result.records[0]?.get("token") ?? null;
  } finally {
    await session.close();
  }
}

// ✅ NEW: Batch function for multiple words (FIXED)
export async function getMultipleSignsFromNeo4j(words: string[]): Promise<Map<string, string>> {
  const driverInstance = getDriver();
  if (!driverInstance) return new Map();
  
  const session = driverInstance.session();
  try {
    // Fix: Use proper parameter syntax
    const result = await session.run(
      `MATCH (w:Word) WHERE w.token IN $words RETURN w.token AS token`,
      { words: words.map(w => w.toLowerCase()) },
    );
    
    const map = new Map<string, string>();
    result.records.forEach((record: any) => {
      const token = record.get("token");
      map.set(token, token.toUpperCase());
    });
    return map;
  } finally {
    await session.close();
  }
}