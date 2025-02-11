const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const axios = require("axios"); //axios 추가 흑
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

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password"); //왜인지 password가 select되지 않아서 추가함
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 사용자입니다." });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "비활성화된 사용자입니다." });
    }

    if (user.isLoggedIn == true) {
      return res.status(401).json({ message: "이미 접속 중인 사용자입니다." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password); //비밀번호 비교
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false; //다섯번 틀리면 계정 비활성화 ㅋㅋ
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

    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.isLoggedIn = true;

    try {
      const response = await axios.get("https://api.ipify.org?format=json"); //공공장소 사용금지요
      const ipAddress = response.data.ip; //한번 정제함
      user.lastLoginIp = ipAddress;
    } catch (error) {
      console.log("IP 주소를 가져오는데 실패했습니다: ", error.message);
    }

    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } //토큰 만료는 1시간
    );

    // console.log(token); //오 된다

    res.cookie("token", token, {
      httpOnly: true, //자바스크립트에서 쿠키 접근 불가
      secure: "production", //https에서만 쿠키 전송
      sameSite: "strict", //같은 사이트에서만 쿠키 전송
      maxAge: 24 * 60 * 60 * 1000, //24시간
    });

    const userWithoutPassword = user.toObject(); //구글링 해보니 이렇게 하면 문서 타입을 일반 객체로 변환할 수 있다고 한다
    delete userWithoutPassword.password; //보안때문에 비밀번호는 삭제할 수 있다고 한다

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.log("서버 오류: ", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
