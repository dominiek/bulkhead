const AuditLog = require('../audit-log');
const User = require('../user');
const Koa = require('koa');
const Router = require('@koa/router');
const request = require('supertest');

const { setupDb, teardownDb } = require('../../utils/testing');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

async function getContext(user) {
  const app = new Koa();
  const productRouter = new Router({
    prefix: '/1/products',
  });
  let current;

  productRouter.use((ctx, next) => {
    ctx.state.authUser = user;
    return next();
  });
  productRouter.get('/:id', async (ctx) => {
    current = ctx;
  });
  app.use(productRouter.routes());
  await request(app.callback()).get('/1/products/id');

  return current;
}

describe('AuditLog', () => {
  describe('getObjectFields', () => {
    it('should return a diff object', async () => {
      const user = await User.create({
        email: 'bob@old.com',
      });
      user.email = 'bob@new.com';
      const fields = AuditLog.getObjectFields(user, ['email']);
      expect(fields.objectId).toBe(user.id);
      expect(fields.objectType).toBe('User');
      expect(fields.objectBefore.email).toBe('bob@old.com');
      expect(fields.objectAfter.email).toBe('bob@new.com');
    });

    it('should maintain original object after saving', async () => {
      const user = await User.create({
        email: 'bob@original.com',
      });
      user.email = 'bob@modified.com';
      await user.save();

      const fields = AuditLog.getObjectFields(user, ['email']);

      expect(fields.objectId).toBe(user.id);
      expect(fields.objectType).toBe('User');
      expect(fields.objectBefore.email).toBe('bob@original.com');
      expect(fields.objectAfter.email).toBe('bob@modified.com');
    });
  });

  describe('getContextFields', () => {
    it('should extract fields from ctx', async () => {
      const user = new User({});
      const ctx = await getContext(user);

      expect(AuditLog.getContextFields(ctx)).toEqual(
        expect.objectContaining({
          requestMethod: 'GET',
          requestUrl: '/1/products/id',
          routeNormalizedPath: '/1/products/:id',
          routePrefix: '/1/products',
          user: user.id,
        })
      );
    });
  });

  describe('append', () => {
    it('should write to the db', async () => {
      const user = new User({ email: 'bob@gmail.com' });
      const ctx = await getContext(user);

      await AuditLog.append('did something', ctx, {
        type: 'security',
        objectId: user.id,
        objectType: 'user',
      });

      const logs = await AuditLog.find({ objectId: user.id });
      expect(logs.length).toBe(1);

      const log = logs[0];
      expect(log.type).toBe('security');
      expect(log.activity).toBe('did something');
      expect(log.objectId.toString()).toBe(user.id);
      expect(log.objectType).toBe('user');
      expect(log.requestMethod).toBe('GET');
      expect(log.requestUrl).toBe('/1/products/id');
      expect(log.routeNormalizedPath).toBe('/1/products/:id');
      expect(log.createdAt).toBeDefined();
      expect(log.user.toString()).toBe(user.id);
    });

    it('dont write if no change happend', async () => {
      const user = new User({ email: 'bob@gmail.com' });
      const ctx = await getContext(user);

      await AuditLog.append('did something', ctx, {
        type: 'security',
        objectId: user.id,
        objectType: 'user',
        objectAfter: {},
        objectBefore: {},
      });

      const logs = await AuditLog.find({ objectId: user.id });
      expect(logs.length).toBe(0);
    });
  });
});
