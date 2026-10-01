// THROWAWAY: proves the CI gate blocks bad PRs. Never merge this file.

// Fake AWS access key ID (not a real credential) for the secret scan to catch
export const fakeAwsAccessKeyId = "AKIA7TPHTUAKOW73BWGG";

// Lint errors for Biome to catch (noDoubleEquals, noDebugger)
export function ciGateCheck(value: unknown) {
  debugger;
  return value == "1";
}
