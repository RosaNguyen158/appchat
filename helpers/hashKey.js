import bycrypt from "bcrypt";

export const hashKey = async (key) => {
  const saltRounds = 10;
  let hashedKey = await bycrypt.hash(key, saltRounds);
  return hashedKey;
};
