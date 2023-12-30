const sse = require('../middlewares/sse');

const registerSSE = (req, res) => {
    sse.addSSEConnection(res);
};


module.exports = { registerSSE };