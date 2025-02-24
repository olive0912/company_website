const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const axios = require("axios");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.log(error);
  }
});
//하..

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password"); //왜인지 mongodb에서 password를 안보내줌
    if (!user) {
      //사용자 없으면
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    if (!user.isActive) {
      //사용자 비활성화됐으면
      return res.status(401).json({ message: "비활성화된 사용자입니다." });
    }

    if (user.isLoggedIn) {
      //로그인 돼있으면
      return res.status(401).json({ message: "이미 로그인된 사용자입니다." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password); //password검증
    if (!isValidPassword) {
      //비번 틀리면
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res.status(401).json({
          message: "비밀번호를 5회 이상 틀려 계정이 비활성화되었습니다.",
        });
      }
      await user.save();
      return res.status(401).json({
        message: "비밀번호가 일치하지 않습니다.",
        remainingAttempts: 5 - user.failedLoginAttempts,
      });
    }

    user.failedLoginAttempts = 0; //초기화
    user.lastLoginAttempt = new Date(); //마지막 로그인시간 기입
    user.isLoggedIn = true; //중복로그인 방지

    // console.log(user); //password가 안옴. ++ 해결

    try {
      const response = await axios.get("https://api.ipify.org?format=json"); //공공와파 금지
      user.ipAddress = response.data.ip; // 정상 동작
      //user.ipAddress = ipAddress;
    } catch (error) {
      console.log("IP 주소를 가져오던 중 오류 발생: ", error.message);
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h", //24시간 만료
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password; //비번 삭제
    res.json({ user: userWithoutPassword });

    console.log(token); //토큰 정상작동
  } catch (error) {
    console.log("서버 오류: ", error.message);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: "이미 로그아웃된 상태입니다." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user) {
        user.isLoggedIn = false;
        await user.save();
      }
    } catch (error) {
      console.log("토큰 검증 오류: ", error.message);
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: "production",
      sameSite: "strict",
    });

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    console.log("로그아웃 오류: ", error.message);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.delete("/delete/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/verify-token", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(400)
      .json({ isValid: false, message: "토큰이 존재하지 않습니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isValid: true, user: decoded });
  } catch (error) {
    return res
      .status(401)
      .json({ isValid: false, message: "토큰이 유효하지 않습니다." });
  }
});

module.exports = router;
