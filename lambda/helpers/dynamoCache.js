import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.CACHE_TABLE_NAME ?? "RentSignalCache";
// 24-hour TTL for market snapshots
const TTL_SECONDS = 60 * 60 * 24;

function makeCacheKey(citySlug, bedrooms) {
  return `MARKET_DATA#${citySlug}#${bedrooms}`;
}

/**
 * Retrieves a cached MarketSnapshot from DynamoDB, or null if missing/expired.
 *
 * @param {string} citySlug
 * @param {number} bedrooms
 * @returns {Promise<object|null>}
 */
export async function getCachedCityData(citySlug, bedrooms) {
  const result = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ cacheKey: makeCacheKey(citySlug, bedrooms) }),
    })
  );

  if (!result.Item) return null;

  const item = unmarshall(result.Item);
  // Respect DynamoDB TTL even before AWS expunges the record
  if (item.expiresAt && item.expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return item.snapshot ?? null;
}

/**
 * Stores a MarketSnapshot in DynamoDB with a 24-hour TTL.
 *
 * @param {string} citySlug
 * @param {number} bedrooms
 * @param {object} snapshot
 * @returns {Promise<void>}
 */
export async function setCachedCityData(citySlug, bedrooms, snapshot) {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall({
        cacheKey: makeCacheKey(citySlug, bedrooms),
        snapshot,
        expiresAt,
      }),
    })
  );
}
