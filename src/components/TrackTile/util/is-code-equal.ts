export const isCodeEqual = (
  code1?: { code: string; system: string },
  code2?: { code: string; system: string }
) => {
  return (
    code1 && code2 && code1.code == code2.code && code1.system === code2.system
  );
};
