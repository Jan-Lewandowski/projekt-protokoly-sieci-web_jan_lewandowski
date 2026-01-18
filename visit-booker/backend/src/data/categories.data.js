export const categories = [{ id: 1, name: "fryzjer", services: [] }];
let nextCategoryId = 1;
let nextServiceId = 1;

export function generateCategoryId() {
  return nextCategoryId++;
}

export function generateServiceId() {
  return nextServiceId++;
}