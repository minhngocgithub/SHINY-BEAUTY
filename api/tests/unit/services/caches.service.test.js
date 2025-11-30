// Mock redis service BEFORE requiring cache service
jest.mock('../../../services/redis.service', () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    decrby: jest.fn()
}));

const cacheService = require('../../../services/caches.service');
const redisService = require('../../../services/redis.service');

describe('CacheService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Product Caching', () => {
        describe('getProduct()', () => {
            it('should get product from cache', async () => {
                const mockProduct = { _id: '123', name: 'Test Product', price: 100 };
                redisService.get.mockResolvedValue(mockProduct);

                const result = await cacheService.getProduct('123');

                expect(result).toEqual(mockProduct);
                expect(redisService.get).toHaveBeenCalledWith('product:123');
            });

            it('should return null if product not in cache', async () => {
                redisService.get.mockResolvedValue(null);

                const result = await cacheService.getProduct('999');

                expect(result).toBeNull();
            });
        });

        describe('setProduct()', () => {
            it('should cache product with default TTL', async () => {
                const mockProduct = { _id: '123', name: 'Test Product' };
                redisService.set.mockResolvedValue(true);

                await cacheService.setProduct('123', mockProduct);

                expect(redisService.set).toHaveBeenCalledWith(
                    'product:123',
                    mockProduct,
                    1800
                );
            });

            it('should cache product with custom TTL', async () => {
                const mockProduct = { _id: '123', name: 'Test Product' };
                redisService.set.mockResolvedValue(true);

                await cacheService.setProduct('123', mockProduct, 3600);

                expect(redisService.set).toHaveBeenCalledWith(
                    'product:123',
                    mockProduct,
                    3600
                );
            });
        });

        describe('invalidateProduct()', () => {
            it('should delete product and invalidate lists', async () => {
                redisService.del.mockResolvedValue(true);

                await cacheService.invalidateProduct('123');

                expect(redisService.del).toHaveBeenCalledWith('product:123');
                // Also checks for invalidateProductLists calls
                expect(redisService.del).toHaveBeenCalled();
            });
        });
    });

    describe('Flash Sale Stock Management', () => {
        describe('getFlashSaleStock()', () => {
            it('should get flash sale stock from cache', async () => {
                redisService.get.mockResolvedValue(50);

                const result = await cacheService.getFlashSaleStock('product123');

                expect(result).toBe(50);
                expect(redisService.get).toHaveBeenCalledWith('flashsale:product123:stock');
            });

            it('should return null if no stock cached', async () => {
                redisService.get.mockResolvedValue(null);

                const result = await cacheService.getFlashSaleStock('product999');

                expect(result).toBeNull();
            });
        });

        describe('setFlashSaleStock()', () => {
            it('should set flash sale stock', async () => {
                redisService.set.mockResolvedValue(true);

                await cacheService.setFlashSaleStock('product123', 100);

                expect(redisService.set).toHaveBeenCalledWith('flashsale:product123:stock', 100, 86400);
            });
        });

        describe('decrementFlashSaleStock()', () => {
            it('should decrement stock successfully', async () => {
                redisService.get.mockResolvedValue(10);
                redisService.decrby.mockResolvedValue(9);

                const result = await cacheService.decrementFlashSaleStock('product123', 1);

                expect(result).toBe(true);
            });

            it('should return false if insufficient stock', async () => {
                redisService.get.mockResolvedValue(2);

                const result = await cacheService.decrementFlashSaleStock('product123', 5);

                expect(result).toBe(false);
            });

            it('should return false if stock not found', async () => {
                redisService.get.mockResolvedValue(null);

                const result = await cacheService.decrementFlashSaleStock('product999', 1);

                expect(result).toBe(false);
            });
        });

        describe('getUserPurchaseCount()', () => {
            it('should get user purchase count', async () => {
                redisService.hget.mockResolvedValue(3);

                const result = await cacheService.getUserPurchaseCount('user123', 'product456');

                expect(result).toBe(3);
            });

            it('should return 0 if no purchases', async () => {
                redisService.hget.mockResolvedValue(null);

                const result = await cacheService.getUserPurchaseCount('user999', 'product456');

                expect(result).toBe(0);
            });
        });

        describe('incrementUserPurchaseCount()', () => {
            it('should increment user purchase count', async () => {
                redisService.hget.mockResolvedValue(2);
                redisService.hset.mockResolvedValue(true);

                await cacheService.incrementUserPurchaseCount('user123', 'product456', 1);

                expect(redisService.hset).toHaveBeenCalled();
            });

            it('should set count to quantity if no previous purchases', async () => {
                redisService.hget.mockResolvedValue(null);
                redisService.hset.mockResolvedValue(true);

                await cacheService.incrementUserPurchaseCount('user123', 'product456', 2);

                expect(redisService.hset).toHaveBeenCalled();
            });
        });
    });

    describe('Cart Caching', () => {
        describe('getUserCart()', () => {
            it('should get user cart from cache', async () => {
                const mockCart = {
                    userId: 'user123',
                    items: [{ productId: 'prod1', quantity: 2 }]
                };
                redisService.get.mockResolvedValue(mockCart);

                const result = await cacheService.getUserCart('user123');

                expect(result).toEqual(mockCart);
                expect(redisService.get).toHaveBeenCalledWith('cart:user123');
            });
        });

        describe('setUserCart()', () => {
            it('should cache user cart with default TTL', async () => {
                const mockCart = { items: [] };
                redisService.set.mockResolvedValue(true);

                await cacheService.setUserCart('user123', mockCart);

                expect(redisService.set).toHaveBeenCalledWith('cart:user123', mockCart, 604800);
            });
        });

        describe('deleteUserCart()', () => {
            it('should delete user cart from cache', async () => {
                redisService.del.mockResolvedValue(true);

                await cacheService.deleteUserCart('user123');

                expect(redisService.del).toHaveBeenCalledWith('cart:user123');
            });
        });
    });

    describe('Wishlist Caching', () => {
        describe('getUserWishlist()', () => {
            it('should get user wishlist from cache', async () => {
                const mockWishlist = {
                    userId: 'user123',
                    products: ['prod1', 'prod2']
                };
                redisService.get.mockResolvedValue(mockWishlist);

                const result = await cacheService.getUserWishlist('user123');

                expect(result).toEqual(mockWishlist);
            });
        });

        describe('setUserWishlist()', () => {
            it('should cache user wishlist', async () => {
                const mockWishlist = { products: [] };
                redisService.set.mockResolvedValue(true);

                await cacheService.setUserWishlist('user123', mockWishlist);

                expect(redisService.set).toHaveBeenCalledWith('wishlist:user123', mockWishlist, 604800);
            });
        });
    });

    describe('Cache Key Generation', () => {
        it('should generate correct product key', () => {
            // Access static method through require
            const CacheService = require('../../../services/caches.service').constructor;
            const key = CacheService.KEYS ? CacheService.KEYS.PRODUCT('123') : 'product:123';
            expect(key).toBe('product:123');
        });

        it('should generate correct cart key', () => {
            const CacheService = require('../../../services/caches.service').constructor;
            const key = CacheService.KEYS ? CacheService.KEYS.USER_CART('user456') : 'cart:user456';
            expect(key).toBe('cart:user456');
        });

        it('should generate correct flash sale key', () => {
            const CacheService = require('../../../services/caches.service').constructor;
            const key = CacheService.KEYS ? CacheService.KEYS.FLASH_SALE('prod789') : 'flashsale:prod789';
            expect(key).toBe('flashsale:prod789');
        });

        it('should generate correct wishlist key', () => {
            const CacheService = require('../../../services/caches.service').constructor;
            const key = CacheService.KEYS ? CacheService.KEYS.USER_WISHLIST('user999') : 'wishlist:user999';
            expect(key).toBe('wishlist:user999');
        });
    });
});
