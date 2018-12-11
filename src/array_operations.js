/**
 * @param {Arrays} any amount of arays
 * @return {Array} exclusion for the arrays
 */
export function excl() {
  return ie.call(
    {
      bool: true
    },
    ...arguments
  );
}
/**
 * @param {Arrays} any amount of arays
 * @return {Array} intersection for the arrays
 */
export function intersec() {
  return union(
    ie.call(
      {
        bool: false
      },
      ...arguments
    )
  );
}
/**
 * @param {Arrays} any amount of arays
 * @return {Array} union for the arrays
 */
export function union() {
  var arr = [];
  var res = [].concat(...arguments);
  for (var x in res) if (!arr.includes(res[x])) arr.push(res[x]);
  return arr;
}
export function ie() {
  let bool = false;
  var arr = [].concat(...arguments);
  return arr.filter(value => {
    var flag = false;
    for (var x in arguments)
      if (arguments[x].includes(value) === bool)
        if (flag || flag === bool) return false;
        else flag = true;
    return true;
  });
}
