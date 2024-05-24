const fs = require('fs');
const os = require('os');
const { request, createUpload, createUser, createAdmin } = require('../../utils/testing');
const { importFixtures } = require('../../utils/fixtures');
const { Upload } = require('../../models');
const { Blob } = require('node:buffer');

const file = __dirname + '/../__fixtures__/test.png';

let createReadStream = fs.createReadStream;

function mockReadStream() {
  fs.createReadStream = (url) => {
    return {
      url,
    };
  };
}

function unmockReadStream() {
  fs.createReadStream = createReadStream;
}

describe('/1/uploads', () => {
  describe('GET /:id', () => {
    it('should be able to access public upload by id', async () => {
      const user = await createUser();
      const upload = await createUpload();
      const response = await request('GET', `/1/uploads/${upload.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.filename).toBe('test.png');
    });

    it('should be able to access private upload as admin', async () => {
      const admin = await createAdmin();
      const upload = await createUpload({
        private: true,
      });
      const response = await request('GET', `/1/uploads/${upload.id}`, {}, { user: admin });
      expect(response.status).toBe(200);
      expect(response.body.data.filename).toBe('test.png');
    });

    it('should not be able to access private upload as viewer', async () => {
      const manager = await importFixtures('users/jack');
      const upload = await createUpload({
        private: true,
      });
      const response = await request(
        'GET',
        `/1/uploads/${upload.id}`,
        {},
        {
          user: manager,
        }
      );
      expect(response.status).toBe(401);
    });

    it('should not allow access private upload when unauthenticated', async () => {
      const upload = await createUpload({
        private: true,
      });
      const response = await request('GET', `/1/uploads/${upload.id}`, {}, {});
      expect(response.status).toBe(401);
    });

    it('should not allow access private upload as other user', async () => {
      const user1 = await createUser();
      const user2 = await createUser();
      const upload = await createUpload({
        owner: user1,
        private: true,
      });
      const response = await request(
        'GET',
        `/1/uploads/${upload.id}`,
        {},
        {
          user: user2,
        }
      );
      expect(response.status).toBe(401);
    });
  });

  describe('GET /:id/raw', () => {
    it('should get a local file stream', async () => {
      mockReadStream();
      const user = await createUser();
      const upload = await createUpload();

      const response = await request('GET', `/1/uploads/${upload.id}/raw`, {}, { user });

      expect(response.status).toBe(200);
      expect(response.body.url.startsWith(os.tmpdir())).toBe(true);
      unmockReadStream();
    });
  });

  describe('POST /', () => {
    it('should be able to create upload', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/uploads', {}, { user, file });
      const [upload] = response.body.data;
      expect(response.status).toBe(200);
      expect(upload.mimeType).toBe('image/png');
      expect(upload.storageType).toBe('local');
      expect(upload.filename).toBe('test.png');
      expect(upload.owner.id).toBe(user.id);
    });

    it('should be able to handle multiple files', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads',
        {},
        {
          user,
          file: [file, file],
        }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data).toMatchObject([
        {
          filename: 'test.png',
          storageType: 'local',
          mimeType: 'image/png',
          owner: {
            id: user.id,
          },
        },
        {
          filename: 'test.png',
          storageType: 'local',
          mimeType: 'image/png',
          owner: {
            id: user.id,
          },
        },
      ]);
    });

    it('should error if no file passed', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/uploads', {}, { user });
      expect(response.status).toBe(400);
    });

    it('should be able to derive a mimeType if the file has one', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads',
        {},
        {
          user,
          file: new Blob(['test'], {
            type: 'text/plain',
          }),
        }
      );
      expect(response.status).toBe(200);
      expect(response.body.data[0]).toMatchObject({
        mimeType: 'text/plain',
      });
    });
  });

  describe('POST /private', () => {
    it('should be able to create private upload', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads/private',
        {},
        {
          user,
          file,
        }
      );
      const [upload] = response.body.data;
      expect(response.status).toBe(200);
      expect(upload.private).toBe(true);
    });

    it('should be able to handle multiple files', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/uploads/private',
        {},
        {
          user,
          file: [file, file],
        }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data).toMatchObject([
        {
          private: true,
          filename: 'test.png',
          storageType: 'local',
          mimeType: 'image/png',
          owner: {
            id: user.id,
          },
        },
        {
          private: true,
          filename: 'test.png',
          storageType: 'local',
          mimeType: 'image/png',
          owner: {
            id: user.id,
          },
        },
      ]);
    });
  });

  describe('DELETE /:upload', () => {
    it('should be able to delete own upload', async () => {
      const user = await createUser();
      const upload = await createUpload({
        owner: user,
      });
      const response = await request('DELETE', `/1/uploads/${upload.id}`, {}, { user });
      expect(response.status).toBe(204);
      const dbUpload = await Upload.findByIdDeleted(upload.id);
      expect(dbUpload.deletedAt).toBeDefined();
    });

    it('should fail if you are not the owner', async () => {
      const user = await createUser();
      const upload = await createUpload();
      const response = await request('DELETE', `/1/uploads/${upload.id}`, {}, { user });
      expect(response.status).toBe(403);
    });
  });
});
