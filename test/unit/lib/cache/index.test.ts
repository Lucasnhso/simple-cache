import { expect, it, describe, vi, afterEach } from 'vitest';
import { Chance } from 'chance';
import Cache from '../../../../lib/cache';
import * as scheduleUtil from '../../../../lib/utils/schedule';
import { InvalidExpirationError, InvalidKeyError } from '../../../../lib/utils/errors';
import { createCacheItem, createCacheItems } from '../utils/fixtures/cache';

describe('Cache - Unit Tests', () => {
  afterEach(() => {
    cache = new CacheTesting();
    vi.clearAllMocks();
  });
  class CacheTesting extends Cache {
    getData() {
      return this.data;
    }
    setData(value: any) {
      this.data = value;
    }
  }
  const chance = new Chance();
  let cache = new CacheTesting();
  const [fixtureKey, fixtureValue] = createCacheItem();
  const fixtureItems = createCacheItems();
  const expiration = chance.millisecond();

  it('should insert one cache item without expiration', () => {
    cache.insertOne(fixtureKey, fixtureValue);
    const data = cache.getData();

    expect(data).toEqual({ [fixtureKey]: fixtureValue });
  });

  it('should insert one cache item with expiration', () => {
    const spy = vi.spyOn(cache, 'setExpiration');
    spy.mockImplementation(async () => {
      return null;
    });

    cache.insertOne(fixtureKey, fixtureValue, expiration);
    const data = cache.getData();

    expect(spy).toHaveBeenCalledOnce();
    expect(data).toEqual({ [fixtureKey]: fixtureValue });
  });

  it('should insert many cache items', () => {
    cache.insertMany(fixtureItems);
    const data = cache.getData();

    expect(data).toEqual({
      [fixtureItems[0].key]: fixtureItems[0].value,
      [fixtureItems[1].key]: fixtureItems[1].value,
      [fixtureItems[2].key]: fixtureItems[2].value
    });
  });

  it('should find one item', () => {
    const item = {
      [fixtureKey]: fixtureValue
    };
    cache.setData(item);

    const result = cache.findOne(fixtureKey);

    expect(result).toEqual(fixtureValue);
  });

  it('should find many items in cache', () => {
    const keys = fixtureItems.map((item) => item.key);
    const data = {
      [fixtureItems[0].key]: fixtureItems[0].value,
      [fixtureItems[1].key]: fixtureItems[1].value,
      [fixtureItems[2].key]: fixtureItems[2].value
    };
    cache.setData(data);

    const result = cache.findMany(keys);

    expect(result).toEqual(data);
  });

  it('should clear log', () => {
    const data = {
      [fixtureItems[0].key]: fixtureItems[0].value,
      [fixtureItems[1].key]: fixtureItems[1].value,
      [fixtureItems[2].key]: fixtureItems[2].value
    };
    cache.setData(data);

    cache.clear();
    const cacheData = cache.getData();

    expect(cacheData).toEqual({});
  });

  it('should expire a item', () => {
    cache.setData({ [fixtureKey]: fixtureValue });

    cache.expire(fixtureKey);
    const cacheData = cache.getData();

    expect(cacheData).toEqual({});
  });

  it('should set a expiration to a item', () => {
    const spy = vi.spyOn(scheduleUtil, 'createSchedule');
    vi.mock('../../../../lib/utils/schedule.ts', () => {
      async function createSchedule() {
        return null;
      }
      return {
        createSchedule
      };
    });
    const expiration = chance.millisecond();

    cache.setExpiration(fixtureKey, expiration);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('Should throw a invalid key error if key is a empty string', () => {
    const exec = () => cache.insertOne('', fixtureValue);
    expect(exec).toThrowError(InvalidKeyError);
  });

  it('Should throw a invalid expiration error expiration if expiration is negative', () => {
    const exec = () => cache.insertOne(fixtureKey, fixtureValue, -expiration);
    expect(exec).toThrowError(InvalidExpirationError);
  });
});
