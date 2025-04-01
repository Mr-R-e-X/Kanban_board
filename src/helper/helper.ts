export function generateRandomSixDigitVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getNewFloatingIndex = (
  prevIndex: number | null,
  nextIndex: number | null
): number => {
  if (prevIndex === null && nextIndex === null) return 1;
  if (prevIndex === null) return nextIndex! / 2;
  if (nextIndex === null) return prevIndex + 1;

  return (prevIndex + nextIndex) / 2;
};
