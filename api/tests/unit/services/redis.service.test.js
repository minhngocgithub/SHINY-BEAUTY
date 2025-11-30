// Mock Redis client BEFORE requiring the service
jest.mock('../../../config/redis', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        exists: jest.fn(),
        keys: jest.fn(),
        hset: jest.fn(),
        hget: jest.fn(),
        hgetall: jest.fn(),
        hdel: jest.fn(),
        sadd: jest.fn(),
        smembers: jest.fn(),
        srem: jest.fn(),
        zadd: jest.fn(),
        zrange: jest.fn(),
        zrem: jest.fn(),
        incr: jest.fn(),
        decr: jest.fn(),
        expire: jest.fn(),
        ttl: jest.fn(),
        flushall: jest.fn()
    }
}));

const redisService = require('../../../services/redis.service');
const { redisClient } = require('../../../config/redis');

describe('RedisService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Operations', () => {
        describe('get()', () => {
            it('should get and parse value from Redis', async () => {
                const testData = { name: 'Test Product', price: 100 };
                redisClient.get.mockResolvedValue(JSON.stringify(testData));

                const result = await redisService.get('test:key');

                expect(result).toEqual(testData);
                expect(redisClient.get).toHaveBeenCalledWith('test:key');
            });

            it('should return null for non-existent key', async () => {
                redisClient.get.mockResolvedValue(null);

                const result = await redisService.get('nonexistent');

                expect(result).toBeNull();
            });

            it('should return null on error', async () => {
                redisClient.get.mockRejectedValue(new Error('Redis error'));

                const result = await redisService.get('error:key');

                expect(result).toBeNull();
            });
        });

        describe('set()', () => {
            it('should set value with TTL', async () => {
                const testData = { name: 'Test', value: 123 };
                redisClient.setex.mockResolvedValue('OK');

                const result = await redisService.set('test:key', testData, 3600);

                expect(result).toBe(true);
                expect(redisClient.setex).toHaveBeenCalledWith(
                    'test:key',
                    3600,
                    JSON.stringify(testData)
                );
            });

            it('should set value without TTL', async () => {
                const testData = { name: 'Test' };
                redisClient.set.mockResolvedValue('OK');

                const result = await redisService.set('test:key', testData, null);

                expect(result).toBe(true);
                expect(redisClient.set).toHaveBeenCalledWith('test:key', JSON.stringify(testData));
            });

            it('should return false on error', async () => {
                redisClient.setex.mockRejectedValue(new Error('Redis error'));

                const result = await redisService.set('test:key', {}, 3600);

                expect(result).toBe(false);
            });
        });

        describe('del()', () => {
            it('should delete key from Redis', async () => {
                redisClient.del.mockResolvedValue(1);

                const result = await redisService.del('test:key');

                expect(result).toBe(true);
                expect(redisClient.del).toHaveBeenCalledWith('test:key');
            });

            it('should return false on error', async () => {
                redisClient.del.mockRejectedValue(new Error('Redis error'));

                const result = await redisService.del('test:key');

                expect(result).toBe(false);
            });
        });

        describe('exists()', () => {
            it('should return true if key exists', async () => {
                redisClient.exists.mockResolvedValue(1);

                const result = await redisService.exists('test:key');

                expect(result).toBe(true);
            });

            it('should return false if key does not exist', async () => {
                redisClient.exists.mockResolvedValue(0);

                const result = await redisService.exists('test:key');

                expect(result).toBe(false);
            });
        });
    });

    describe('Pattern Operations', () => {
        describe('deletePattern()', () => {
            it('should delete all keys matching pattern', async () => {
                redisClient.keys.mockResolvedValue(['key1', 'key2', 'key3']);
                redisClient.del.mockResolvedValue(3);

                const result = await redisService.deletePattern('test:*');

                expect(result).toBe(3);
                expect(redisClient.keys).toHaveBeenCalledWith('test:*');
            });

            it('should return 0 if no keys match', async () => {
                redisClient.keys.mockResolvedValue([]);

                const result = await redisService.deletePattern('test:*');

                expect(result).toBe(0);
            });
        });
    });

    describe('Hash Operations', () => {
        describe('hset()', () => {
            it('should set hash field', async () => {
                const testData = { price: 100 };
                redisClient.hset.mockResolvedValue(1);

                const result = await redisService.hset('product:1', 'details', testData);

                expect(result).toBe(true);
                expect(redisClient.hset).toHaveBeenCalledWith(
                    'product:1',
                    'details',
                    JSON.stringify(testData)
                );
            });
        });

        describe('hget()', () => {
            it('should get hash field value', async () => {
                const testData = { price: 100 };
                redisClient.hget.mockResolvedValue(JSON.stringify(testData));

                const result = await redisService.hget('product:1', 'details');

                expect(result).toEqual(testData);
            });

            it('should return null for non-existent field', async () => {
                redisClient.hget.mockResolvedValue(null);

                const result = await redisService.hget('product:1', 'missing');

                expect(result).toBeNull();
            });
        });
    });

    describe('Set Operations', () => {
        describe('sadd()', () => {
            it('should add members to set', async () => {
                redisClient.sadd.mockResolvedValue(1);

                const result = await redisService.sadd('users:active', 'user1');

                expect(result).toBe(true);
            });
        });

        describe('smembers()', () => {
            it('should get all set members', async () => {
                redisClient.smembers.mockResolvedValue(['user1', 'user2']);

                const result = await redisService.smembers('users:active');

                expect(result).toEqual(['user1', 'user2']);
            });
        });
    });

    describe('Counter Operations', () => {
        describe('incr()', () => {
            it('should increment counter', async () => {
                redisClient.incr.mockResolvedValue(5);

                const result = await redisService.incr('page:views');

                expect(result).toBe(5);
            });
        });

        describe('decr()', () => {
            it('should decrement counter', async () => {
                redisClient.decr.mockResolvedValue(3);

                const result = await redisService.decr('stock:count');

                expect(result).toBe(3);
            });
        });
    });

    describe('TTL Operations', () => {
        describe('expire()', () => {
            it('should set expiration on key', async () => {
                redisClient.expire.mockResolvedValue(1);

                const result = await redisService.expire('session:123', 3600);

                expect(result).toBe(true);
            });
        });

        describe('ttl()', () => {
            it('should get TTL of key', async () => {
                redisClient.ttl.mockResolvedValue(1800);

                const result = await redisService.ttl('session:123');

                expect(result).toBe(1800);
            });

            it('should return -1 for key with no expiration', async () => {
                redisClient.ttl.mockResolvedValue(-1);

                const result = await redisService.ttl('permanent:key');

                expect(result).toBe(-1);
            });
        });
    });
});
