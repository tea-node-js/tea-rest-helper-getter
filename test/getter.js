
const assert = require('assert');
const rest = require('tea-rest');
const om = require('tea-rest-plugin-mysql');
const getterHelper = require('../');

om(rest);

const getter = getterHelper(rest);
const { Sequelize } = rest;
const sequelize = new Sequelize();

const Book = sequelize.define('book', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

/* global describe it */
describe('tea-rest-helper-getter', () => {
  describe('Helper init', () => {
    it('First argument type error', (done) => {
      assert.throws(() => {
        getter({});
      }, err => err instanceof Error && err.message === 'Model must be a class of Sequelize defined');
      done();
    });

    it('Second argument must be string', (done) => {
      assert.throws(() => {
        getter(Book);
      }, (err) => {
        const msg = 'Geted instance will hook on req.hooks[hook], so `hook` must be a string';
        return err instanceof Error && err.message === msg;
      });
      done();
    });

    it('Third argument must be string', (done) => {
      assert.throws(() => {
        getter(Book, 'book', []);
      }, err => err instanceof Error && err.message === 'Gets the value at path of object.');
      done();
    });

    it('All arguments right no exception', (done) => {
      const helper = getter(Book, 'book');
      const ctx = {
        hooks: {},
        params: { id: 20 },
      };
      const book = { id: 20, name: 'JavaScript 高级程序设计' };

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve) => {
          resolve(book);
        });
      };

      helper(ctx, (err) => {
        assert.equal(null, err);
        assert.equal(ctx.hooks.book, book);
        done();
      });
    });

    it('All arguments right no exception id = req.hooks[obj][id]', (done) => {
      const helper = getter(Book, 'book', 'hooks.user.bookId');

      const ctx = {
        hooks: {
          user: { bookId: 30 },
        },
        params: { id: 20 },
      };

      const book = { id: 20, name: 'JavaScript 高级程序设计' };

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { id: 30 } }, opts);
        return new Promise((resolve) => {
          resolve(book);
        });
      };

      helper(ctx, (err) => {
        assert.equal(null, err);
        assert.equal(ctx.hooks.book, book);
        done();
      });
    });

    it('All arguments right with special key and value', (done) => {
      const helper = getter(Book, 'book', 'hooks.user.bookId', 'bookId');

      const ctx = {
        hooks: {
          user: { bookId: 30 },
        },
        params: { id: 20 },
      };

      const book = { id: 20, name: 'JavaScript 高级程序设计' };

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { bookId: 30 } }, opts);
        return new Promise((resolve) => {
          resolve(book);
        });
      };

      helper(ctx, (err) => {
        assert.equal(null, err);
        assert.equal(ctx.hooks.book, book);
        done();
      });
    });

    it('All arguments right has exception', (done) => {
      const helper = getter(Book, 'book');
      const ctx = {
        hooks: {},
        params: { id: 20 },
        res: {
          sequelizeIfError: ({
            errors = null, message = null,
          }) => {
            assert.equal(null, errors);
            assert.equal('Find book error', message);
            done();
          },
        },
      };

      const error = Error('Find book error');

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(ctx);
    });

    it('All arguments right includes', (done) => {
      Book.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true,
        },
      };

      const helper = getter(Book, 'book');
      const ctx = {
        hooks: {},
        params: { id: 20, includes: 'user' },
        res: {
          sequelizeIfError: ({
            errors = null, message = null,
          }) => {
            assert.equal(null, errors);
            assert.equal('Find book error', message);
            done();
          },
        },
      };

      const error = Error('Find book error');

      Book.findOne = (opts) => {
        assert.deepEqual({
          where: { id: 20 },
          include: [{
            model: User,
            as: 'creator',
            required: true,
          }],
        }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(ctx);
    });

    it('All arguments none includes', (done) => {
      Book.includes = undefined;
      const helper = getter(Book, 'book');
      const ctx = {
        hooks: {},
        params: { id: 20, includes: 'user' },
        res: {
          sequelizeIfError: ({
            errors = null, message = null,
          }) => {
            assert.equal(null, errors);
            assert.equal('Find book error', message);
            done();
          },
        },
      };
      const error = Error('Find book error');

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(ctx);
    });
    it('All arguments params includes isnt string', (done) => {
      Book.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true,
        },
      };

      const helper = getter(Book, 'book');
      const ctx = {
        hooks: {},
        params: { id: 20, includes: ['user'] },
        res: {
          sequelizeIfError: ({
            errors = null, message = null,
          }) => {
            assert.equal(null, errors);
            assert.equal('Find book error', message);
            done();
          },
        },
      };
      const error = Error('Find book error');

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(ctx);
    });
    it('All arguments params includes dont match', (done) => {
      Book.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true,
        },
      };

      const helper = getter(Book, 'book');
      const ctx = {
        hooks: {},
        params: { id: 20, includes: 'author' },
        res: {
          sequelizeIfError: ({
            errors = null, message = null,
          }) => {
            assert.equal(null, errors);
            assert.equal('Find book error', message);
            done();
          },
        },
      };
      const error = Error('Find book error');

      Book.findOne = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(ctx);
    });
  });
});
