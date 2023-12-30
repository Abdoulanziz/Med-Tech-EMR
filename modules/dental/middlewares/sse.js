const SSEConnections = [];

function sendSSEUpdateToAll(data) {
  SSEConnections.forEach((res) => {
    res.write(`data: ${data}\n\n`);
  });
}

function sendSSEUpdateToAllExcept(data, excludedRes) {
  SSEConnections.forEach((res) => {
    // Ensure the response object is not the one we want to exclude
    if (res !== excludedRes && !res.finished && res.writableEnded !== true) {
      res.write(`data: ${data}\n\n`);
    }
  });
}

function addSSEConnection(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial message when a client connects
  res.write('data: Connected\n\n');

  // Add the response object to the SSEConnections array
  SSEConnections.push(res);

  // Handle client disconnect
  res.on('close', () => {
    // Remove the response object when the client disconnects
    SSEConnections.splice(SSEConnections.indexOf(res), 1);
  });
}

module.exports = {
  sendSSEUpdateToAll,
  sendSSEUpdateToAllExcept,
  addSSEConnection,
};
