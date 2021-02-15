const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let users = [];

router.get('/subscribe', async (ctx, next) => {
  ctx.body = await new Promise((resolve) => {
    users.push(resolve);
  });

  await next();
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!ctx.request.body.message) {
    ctx.throw(400);
  }

  users.forEach((resolve) => resolve(message));
  users = [];

  ctx.response.status = 200;
  await next();
});

app.use(router.routes());

module.exports = app;
