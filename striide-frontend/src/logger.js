import log from 'loglevel';

// Save the original methodFactory
const originalFactory = log.methodFactory;

log.methodFactory = (methodName, logLevel, loggerName) => {
    const originalMethod = originalFactory(methodName, logLevel, loggerName); // Use the saved original factory
    return (...args) => {
        originalMethod(...args); // Log to console

        // Send log to the server
        const message = args.join(' ');
        fetch('https://a1b3-122-172-85-38.ngrok-free.app/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                level: methodName,
                message,
                timestamp: new Date().toISOString(),
            }),
        }).catch((error) => console.error('Failed to send log:', error));
    };
};

// Set the desired log level
log.setLevel('info');

export default log;
