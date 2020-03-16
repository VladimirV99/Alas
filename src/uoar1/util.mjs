/**
 * Checks if a number is between min and max
 * @param {number} number Number to check
 * @param {number} min Minimum
 * @param {number} max Maximum
 * @returns {boolean} True if number is in bounds, false otherwise
 */
export function isInBounds(number, min, max){
  return number>=min && number<=max;
}

/**
 * Checks if a base is valid
 * @param {number} base Base to validate
 * @returns {boolean} is base inside bounds
 */
export function isValidBase(base){
  return base!=null && base>1 && base<36;
}

/**
 * Creates a constant string with specified length
 * @param {string} constant Contents of the string
 * @param {number} length Length of the string
 * @returns {string} Constant string of specified length
 */
export function createConstantString(constant, length){
  if(constant.length != 1 || length<0)
    return null;
  let res = "";
  for(let i = 0; i<length; i++){
    res = res.concat(constant);
  }
  return res;
}

/**
 * Creates a zero string with specified length
 * @param {number} length Length of the string
 * @returns {string} Zero string of specified length
 */
export function createZeroString(length){
  return createConstantString("0", length);
}