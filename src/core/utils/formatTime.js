import moment from 'moment';
/**
 * Format time
 *
 * @param {string} time Time to be formatted
 * @param {string} format Desired date format
 * @returns {string} Formatted date
 */

export default (time ) => {  
  // moment(undefined) returns the current date, so return the empty string instead    
  return time ? moment(time,'HHmmss.SSS').format('hh:mm A') : '';
};
