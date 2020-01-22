const validator = require('func-args-validator');
const _ = require('lodash');

const modelInclude = (params, includes) => {
  if (!includes) return undefined;
  if (!_.isString(params.includes)) return undefined;
  const ret = _.filter(params.includes.split(','), x => includes[x]);
  if (ret.length === 0) return undefined;
  return _.map(ret, x => _.clone(includes[x]));
};

const getter = (Model, hook, keyPath) => (
  async (ctx, next) => {
    const id = _.get(ctx, keyPath);
    const include = modelInclude(ctx.params, Model.includes);
    const opt = { where: { id } };
    if (include) opt.include = include;
    try {
      const model = await Model.find(opt);
      ctx.hooks[hook] = model;
      await next();
    } catch (error) {
      ctx.res.sequelizeIfError(error);
    }
  }
);

module.exports = (rest) => {
  const { Sequelize } = rest;

  rest.helper.getter = validator(getter, [{
    name: 'Model',
    type: Sequelize.Model,
    message: 'Model must be a class of Sequelize defined',
  }, {
    name: 'hook',
    type: String,
    allowNull: false,
    message: 'Geted instance will hook on req.hooks[hook], so `hook` must be a string',
  }, {
    name: 'keyPath',
    type: String,
    allowNull: false,
    defaultValue: 'params.id',
    message: 'Gets the value at path of object.',
  }]);

  return rest.helper.getter;
};
