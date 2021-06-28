export const getRandInt = (min, max) => {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin) + newMin);
};

export const serialize = (json) => JSON.stringify(json);

export default null;
