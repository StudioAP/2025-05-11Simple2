// app/utils/test-helpers.ts
// Placeholder for testing utility functions

export const mockFunction = () => {
  console.log('Mock function called');
  return true;
};

export const anotherMockFunction = <T>(input: T): { data: T; error: null } => {
  console.log('Another mock function called with:', input);
  return { data: input, error: null };
};
