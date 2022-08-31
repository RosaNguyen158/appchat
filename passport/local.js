const { findByUsername } = require("@/services/socketServices");
import bycrypt from "bcrypt";

const LocalStrategy = require("passport-local").Strategy;

export const localStrategy = new LocalStrategy(
  { session: false },
  async (username, password, callback) => {
    const user = await findByUsername(username);

    if (!user) {
      callback(null, false);
    } else {
      const validPassword = await bycrypt.compare(password, user.password);
      if (!validPassword) {
        callback(null, false);
      } else callback(null, { id: user.id, username });
    }
  }
);
