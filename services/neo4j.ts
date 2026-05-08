import neo4j from "neo4j-driver";

export async function findNearestSemanticWord(word: string): Promise<string | null> {
  if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
    return null;
  }
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  );
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (w:Word {token: $word})-[:CLOSE_TO]->(n:Word) RETURN n.token AS token LIMIT 1",
      { word },
    );
    return result.records[0]?.get("token") ?? null;
  } finally {
    await session.close();
    await driver.close();
  }
}
