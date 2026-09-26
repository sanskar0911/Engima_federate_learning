export const detectSynthetic = (user) => {
  let score = 0;
  let reasons = [];

  if (!user.pan) {
    score += 40;
    reasons.push("Missing PAN");
  }

  if (!user.aadhaar) {
    score += 40;
    reasons.push("Missing Aadhaar");
  }

  if (user.accountAge < 30) {
    score += 20;
    reasons.push("Very new account");
  }

  if (user.transactionCount < 5) {
    score += 20;
    reasons.push("Low activity profile");
  }

  return {
    isSynthetic: score > 60,
    score,
    reasons,
  };
};