export const services = [];

let nextServiceId = 1;

export function generateServiceId() {
  return nextServiceId++;
}
