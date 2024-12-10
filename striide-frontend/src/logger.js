import log from 'loglevel';

// Set the logging level (default to "info")
log.setLevel(process.env.REACT_APP_LOG_LEVEL || "info");

// Function to send logs to Logstash (via HTTP)
const sendLogToLogstash = async (logMessage, level) => {
  try {
    await fetch('http://localhost:4001/api/log', {  // Logstash URL (adjust the port if necessary)
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: logMessage,
        level: level,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Failed to send log to Logstash", error);
  }
};

// Override the log method to send logs to Logstash
const originalLog = log.methodFactory;
log.methodFactory = (methodName, logLevel) => {
  const originalMethod = originalLog(methodName, logLevel);

  return (...args) => {
    const message = args.join(" "); // Combine the arguments into a single log message

    // Send logs to Logstash
    sendLogToLogstash(message, methodName);

    // Call the original log method (to still log to console)
    originalMethod(...args);
  };
};

export default log;
