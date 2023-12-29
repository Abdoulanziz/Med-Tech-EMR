const sse = require('../../common/middlewares/sse');

const registerSSE = (req, res) => {
    sse.addSSEConnection(res);
};


module.exports = { registerSSE };