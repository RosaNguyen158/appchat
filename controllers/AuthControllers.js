import { authenticator } from '@otplib/preset-default'
import bycrypt from 'bcrypt'
import dotenv from 'dotenv'
import geoip from 'geoip-lite'
import jwt from 'jsonwebtoken'
import qrcode from 'qrcode'
import UAParser from 'ua-parser-js'

import { AppDataSource } from '@/app.js'
import { Setting } from '@/entities/Setting'
import { makeid } from '@/helpers/generateKey'
import { generateTokens } from '@/helpers/generateToken'
import { hashKey } from '@/helpers/hashKey'
import { sendOTPVerificationEmail } from '@/helpers/otpEmail'
import { findUser, userPrivacy } from '@/services/socketServices'

import { Session } from '../entities/Session'
import { User } from '../entities/User'

dotenv.config()

export const register = async (req, res) => {
    try {
        let checkUsername = await AppDataSource.getRepository(User).findOne({
            where: {
                username: req.body.username,
            },
        })
        if (checkUsername) {
            return res.json({ message: 'This username already used' })
        }
        let checkEmail = await AppDataSource.getRepository(User).findOne({
            where: {
                email: req.body.email,
            },
        })
        if (checkEmail) {
            return res.json({ message: 'This email already used' })
        }
        const user = new User()
        user.password = await hashKey(req.body.password)
        user.username = req.body.username
        user.email = req.body.email
        await AppDataSource.manager.save(user)

        const userSetting = new Setting()
        userSetting.userId = user.id
        await AppDataSource.manager.save(userSetting)
        console.log(user.id)

        //send Temp token
        const userSession = await createSession(req, user)
        // user.tempToken = jwt.sign({ username }, user.refreshSecretKey);
        // await AppDataSource.manager.save(user, (err, user) => {
        //   if (err) {
        //     return res.json({
        //       message: "Error to create temporary token",
        //     });
        //   }
        // });
        await sendOTPVerificationEmail(user)
        return res.json({
            message: 'Sending OTP to your email',
            token: userSession.refreshToken,
        })
    } catch (error) {
        return res.json({ message: error.message })
    }
}

export const verifyOTPEmail = async (req, res) => {
    try {
        const otp = req.body.otp
        const token = req.headers['authorization']
        let userSession = await AppDataSource.getRepository(Session).findOne({
            where: {
                refreshToken: token,
            },
        })
        const user = await findUser(userSession.userId)
        if (!user) {
            return res.json({ message: 'OTP is invalid' })
        }
        if (!otp) {
            return res.json({ message: 'OTP is invalid' })
        } else {
            let hashedOTP = user.otpEmail
            const validOTP = await bycrypt.compare(`${otp}`, hashedOTP)
            if (!validOTP) {
                res.json({ message: 'Failed to verify OTP' })
                userSession.refreshToken = null
            } else {
                user.otpEmail = null
                await AppDataSource.manager.save(user)
                const userSession = await createSession(req, user)
                return res.json({
                    message: 'new token',
                    token: userSession.token,
                })
            }
        }
    } catch (error) {
        console.log(error)
        return res.json({
            status: 'FAILED',
            message: error.message,
        })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        let user = await AppDataSource.getRepository(User).findOne({
            where: {
                username: username,
            },
        })
        if (!user) {
            return res.json({ message: 'Username or password is incorrect' })
        }
        const validPassword = await bycrypt.compare(password, user.password)
        if (!validPassword) {
            return res.json({ message: 'Username or password is incorrect' })
        }
        const userSetting = await userPrivacy(user.id)
        if (userSetting.twoStepVerification) {
            user.tempToken = jwt.sign({ username }, user.r  efreshSecretKey)
            await AppDataSource.manager.save(user, (err) => {
                if (err) {
                    return res.json({
                        message: 'Login Error',
                    })
                }
            })
            return res.json({
                tempToken: user.tempToken,
            })
        } else {
            const userSession = await createSession(req, user)
            return res.json({
                message: 'new token',
                token: userSession.token,
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const verifyToLogin = async (req, res) => {
    try {
        // passport.authenticate("local", function (err, user) {
        //   if (err) {
        //     return res.json({ message: err.message });
        //   }
        //   if (!user) {
        //     return res.json({ message: "Username or password is incorrect" });
        //   }

        // });
        const tempToken = req.headers['authorization']
        console.log('tempToken', tempToken)
        let user = await AppDataSource.getRepository(User).findOne({
            where: {
                tempToken: tempToken,
            },
        })
        if (!user) {
            return res.json({ message: 'Error' })
        } else {
            let otp = req.body.otp
            let secret = user.secret2FA
            user.tempToken = null
            await AppDataSource.manager.save(user)
            if (!otp) {
                res.json('FAIL')
            } else {
                const validOTP = authenticator.check(otp, secret)
                if (!validOTP) {
                    res.json({ message: 'Login Failed' })
                } else {
                    const userSession = await createSession(req, user)
                    if (!userSession) {
                        return res.json({
                            message: 'Login Failed',
                        })
                    }
                    return res.json({
                        message: 'Logged in successfully',
                        token: userSession.token,
                    })
                }
            }
        }
    } catch (error) {
        console.log(error)
        return res.json({
            status: 'FAILED',
            message: error.message,
        })
    }
}

export const twoFAEnable = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await AppDataSource.getRepository(User).findOne({
            where: {
                username: username,
            },
        })
        if (!user) {
            return res.json({
                message: 'Username or password is incorrect',
                token: req.token,
            })
        } else if (user.id != req.user.id) {
            return res.json({
                message: 'Username or password is incorrect',
                token: req.token,
            })
        } else {
            const validPassword = await bycrypt.compare(
                password,
                req.user.password
            )
            console.log(validPassword)
            if (!validPassword) {
                return res.json({
                    message: 'Username or password is incorrect',
                    token: req.token,
                })
            }
            const secret = authenticator.generateSecret()
            user.secret2FA = secret
            await AppDataSource.manager.save(user)
            const otp = authenticator.generate(user.secret2FA)
            const otpauth = authenticator.keyuri(
                user.username,
                'App Chat',
                secret
            )
            qrcode.toDataURL(otpauth, (err, imageUrl) => {
                if (err) {
                    return res.json({ message: err.message, token: req.token })
                } else {
                    return res.json({
                        otp: otp,
                        img: imageUrl,
                        token: req.token,
                    })
                }
            })
        }
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const verifyToEnable = async (req, res) => {
    try {
        let otp = req.body.otp
        let findUser = await AppDataSource.getRepository(User).findOne({
            where: {
                id: req.user.id,
            },
        })
        const userSetting = await AppDataSource.getRepository(Setting).findOne({
            where: {
                userId: findUser.id,
            },
        })
        if (!otp) {
            return res.json({ message: 'Fail!', token: req.token })
        } else {
            let secret2FA = findUser.secret2FA
            const validOTP = authenticator.check(otp, secret2FA)
            if (!validOTP) {
                return res.json({
                    message: 'OTP is incorrect',
                    token: req.token,
                })
            } else {
                let recovery = makeid(15)
                findUser.recovery = recovery
                await AppDataSource.manager.save(findUser)
                userSetting.twoStepVerification = true
                await AppDataSource.manager.save(userSetting, (err) => {
                    if (err) {
                        return res.json({
                            send: err.message,
                            token: req.token,
                        })
                    }
                })
                return res.status(200).json({
                    message: '2FA enabled',
                    recovery: recovery,
                    token: req.token,
                })
            }
        }
    } catch (error) {
        return res.json({
            status: 'FAILED',
            message: error.message,
            token: req.token,
        })
    }
}

export const loginRecovery = async (req, res) => {
    const tempToken = req.headers['authorization']
    let user = await AppDataSource.getRepository(Session).findOne({
        where: {
            tempToken: tempToken,
        },
    })
    if (!user) {
        return res.json({ message: 'User is not found' })
    }
    let userRecovery = await AppDataSource.getRepository(User).findOne({
        where: {
            recovery: req.body.recovery,
        },
    })
    if (!userRecovery) {
        return res.json({ send: 'Recovery code is incorrect' })
    } else if (user.id != userRecovery.id) {
        return res.json({ send: 'Recovery code or account incorrect' })
    } else {
        let userSetting = await AppDataSource.getRepository(Setting).findOne({
            where: {
                userId: user.id,
            },
        })
        userSetting.twoStepVerification = false
        user.recovery = null
        user.tempToken = null
        user.secret2FA = null
        await AppDataSource.manager.save(user)
        await AppDataSource.manager.save(userSetting)
        const userSession = await createSession(req, user)
        if (!userSession) {
            return res.json({
                message: 'Login Failed',
            })
        }
        return res.json({
            message: 'Logged in successfully',
            token: userSession.token,
        })
    }
}

export const resetPassword = async (req, res) => {
    const tempToken = req.headers['authorization']
    let user = await AppDataSource.getRepository(User).findOne({
        where: {
            tempToken: tempToken,
        },
    })
    if (user) {
        user.tempToken = null
        user.password = await hashKey(req.body.password)
        user.secret2FA = null
        await AppDataSource.manager.save(user, (err) => {
            if (err) {
                return res.json({
                    message: err.message,
                })
            }
        })
        const userSetting = await AppDataSource.getRepository(Setting).findOne({
            where: {
                userId: user.id,
            },
        })
        userSetting.twoStepVerification = false
        await AppDataSource.manager.save(userSetting, (err) => {
            if (err) {
                return res.json({
                    message: err.message,
                })
            }
        })
        return res.json({
            message: 'Reset password success',
        })
    } else {
        return res.json({ message: 'Temporary token is not found' })
    }
}

export const resetPassword = async (req, res) => {
  const temp_token = req.headers["authorization"];
  let user = await AppDataSource.getRepository(User).findOne({
    where: {
      temp_token: temp_token,
    },
  });
  if (user) {
    user.temp_token = null;
    user.password = await hashKey(req.body.password);
    user.secret_2FA = null;
    await AppDataSource.manager.save(user, (err, user) => {
      if (err) {
        return res.json({
          message: err.message,
        });
      }
    });
<<<<<<< HEAD
    const userSetting = await AppDataSource.getRepository(Setting).findOne({
=======
  }
};

export const verify = async (req, res, next) => {
  try {
    let user_name = req.body.username;
    let pass_word = req.body.password;
    let otp = req.body.otp;
    console.log(otp);
    let findUser = await AppDataSource.getRepository(User).findOne({
>>>>>>> 1f4d3ef1b82e964103c20eaa68ce240d15e52429
      where: {
        user_id: user.id,
      },
    });
    userSetting.two_step_verification = false;
    await AppDataSource.manager.save(userSetting, (err, user) => {
      if (err) {
        return res.json({
          message: err.message,
        });
      }
    });
    return res.json({
      message: "Reset password success",
    });
  } else {
    return res.json({ message: "Temporary token is not found" });
  }
};

export const logout = async (req, res) => {
<<<<<<< .merge_file_WgdTDJ
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader; // token
  let user_session = await AppDataSource.getRepository(Session).findOne({
    where: {
      token: token,
    },
  });
  user_session.refresh_token = null;
  await AppDataSource.manager.save(user_session);
  res.json("Success Logout");
};

export const createSession = async (req, user) => {
  try {
    const { username, password } = user;
    console.log(username, password);
    user.is_active = true;
    const tokens = generateTokens(user);
    const user_session = new Session();
    user_session.token = tokens.accessToken;
    user_session.refresh_token = tokens.refreshToken;
    user_session.user_id = user.id;
    user_session.agent_info = req.headers["user-agent"];
    const geo = geoip.lookup("222.253.42.176");
    user_session.location = geo.country;
    user_session.ip_address = req.ip;
    const agent_info = UAParser(
      "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1"
    );
    user_session.agent_os = agent_info.os.name;
    user_session.agent_browser = agent_info.browser.name;
    user_session.device_name = agent_info.device.vendor;
    await AppDataSource.manager.save(user_session);
    await AppDataSource.manager.save(user);
    console.log(user_session);
    return user_session;
  } catch (error) {
    console.log(error);
    return false;
  }
};
=======
    try {
        const authorizationHeader = req.headers['authorization']
        const token = authorizationHeader // token
        let user_session = await AppDataSource.getRepository(Session).findOne({
            where: {
                token: token,
            },
        })
        user_session.refreshToken = null
        user_session.token = null
        await AppDataSource.manager.save(user_session)
        res.json({ message: 'Success Logout' })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const createSession = async (req, user) => {
    try {
        user.isActive = true
        const tokens = generateTokens(user)
        const user_session = new Session()
        user_session.token = tokens.accessToken
        user_session.refreshToken = tokens.refreshToken
        user_session.userId = user.id
        user_session.agent_info = req.headers['user-agent']
        const geo = geoip.lookup('222.253.42.176')
        user_session.location = geo.country
        user_session.ipAddress = req.ip
        const agent_info = UAParser(
            'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1'
        )
        user_session.agentOs = agent_info.os.name
        user_session.agentBrowser = agent_info.browser.name
        user_session.deviceName = agent_info.device.vendor
        await AppDataSource.manager.save(user_session)
        await AppDataSource.manager.save(user)
        return user_session
    } catch (error) {
        console.log(error)
        return false
    }
}
>>>>>>> .merge_file_zes2CM
