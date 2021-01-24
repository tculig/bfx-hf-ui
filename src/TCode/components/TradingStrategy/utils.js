const _ = require('lodash');

export function getFactor(dataset, index) {
  const factor = dataset[index].close / dataset[index].close2;
  return factor;
}

export function rebase(dataset, index) {
  const result = _.cloneDeep(dataset);
  const factor = getFactor(dataset, index);
  for (let i = 0; i < dataset.length; i++) {
    result[i].close2 *= factor;
  }
  return result;
}
