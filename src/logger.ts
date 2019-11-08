import { getLogger } from 'log4js';

import { NAME } from './constants';

export const logger = getLogger(NAME);
switch (process.env.NODE_ENV) {
  case 'development':
  case 'test':
    logger.level = 'info';
    break;
  default:
    logger.level = 'error';
    break;
}
