export const SSE = {
    eventSource: null,
    messageHandlers: {}, // Mapping of message types to functions

    // Initialize SSE connection
    initializeSSE: (url) => {
        SSE.eventSource = new EventSource(url);

        SSE.eventSource.onmessage = function (event) {
            const eventData = event.data;
            SSE.updateUI(eventData);
        };

        SSE.eventSource.onerror = function (error) {
            console.error('EventSource failed:', error);
            SSE.closeSSE();
        };
    },

    // Update the UI based on the received data
    updateUI: (data) => {
        // Check if a handler function is defined for the received message type
        if (SSE.messageHandlers[data] && typeof SSE.messageHandlers[data] === 'function') {
            // Execute the corresponding handler function
            SSE.messageHandlers[data]();
        } else {
            // Default logic when no specific handler is defined
            console.log('No handler for message type:', data);
        }
    },

    // Close the SSE connection
    closeSSE: () => {
        if (SSE.eventSource) {
            SSE.eventSource.close();
        }
    },

    // Register a handler function for a specific message type
    registerMessageHandler: (messageType, handlerFunction) => {
        SSE.messageHandlers[messageType] = handlerFunction;
    },
};
