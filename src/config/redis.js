const redis = require('redis');

const client = redis.createClient({
    url: 'redis://100.66.128.18:6379'
});
client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis đã kết nối thành công!'));
(async () => {
    await client.connect();
})();

module.exports = client;