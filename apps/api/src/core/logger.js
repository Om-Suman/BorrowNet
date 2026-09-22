import config from '../config/index.js';

class Logger {
  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    
    if (config.isDev) {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      console[level === 'error' ? 'error' : 'log'](`[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}`);
    } else {
      console[level === 'error' ? 'error' : 'log'](JSON.stringify({ timestamp, level, message, ...meta }));
    }
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  debug(message, meta) {
    if (!config.isProd) {
      this.log('debug', message, meta);
    }
  }
}

export default new Logger();
