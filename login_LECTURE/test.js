"use strict";
// 라이브러리
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // 비밀번호 암호화
const nodemailer = require('nodemailer'); //메일 발송

const app = express();
const port = 3000;

//앱 세팅
app.set("views", "./views");
app.set("view engine", "ejs");

// 데이터 베이스 임시
const sellers = [];
const customers = [];

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true }));

//메일 서버 연결
const transporter = nodemailer.createTransport({
    service: 'gmail', // gmail을 사용함
    auth: {
      user: '', // 나의 (작성자) 이메일 주소
      pass: '' // 이메일의 앱 비밀번호
    }
});

//홈페이지
app.get("/", (req, res) => {
    res.render("home/index");
});

// 회원가입 페이지 (구매자용)
app.get("/signup_customer", (req, res) => {
    res.render("home/signup_customer");
});

// 회원가입 처리 (구매자용)
app.post("/signup_customer", async (req, res) => {
    const { name, username, password, email, phone } = req.body;
    
    // 비밀번호 해시 생성 (10은 해시 강도)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 정보 저장 (배열에 임시 저장)
    customers.push({ name, username, password: hashedPassword, email, phone });

    // 이메일 전송
    const mailOptions = {
        from: '', // 발신자 이메일
        to: email, // 수신자 이메일
        subject: '회원가입 완료 안내',
        text: `안녕하세요, ${name}님! 구매자 회원가입이 완료되었습니다. 감사합니다!`
    };

    // 이메일 전송 성공 실패 여부
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('이메일 전송 오류:', error);
            return res.status(500).send('이메일 전송 중 오류가 발생했습니다.');
        }
        console.log('이메일 전송 성공:', info.response);
    });

    console.log(customers); // 사용자 목록을 콘솔에 출력 (확인용)
    
    res.send("회원가입이 완료되었습니다! <a href='/login'>로그인 페이지로</a>");
});

// 회원가입 페이지 (판매자용)
app.get("/signup_seller", (req, res) => {
    res.render("home/signup_seller");
});

// 회원가입 처리 (판매자용)
app.post("/signup_seller", async (req, res) => {
    const { name, username, password, email, phone, business } = req.body;
    
    // 비밀번호 해시 생성 (10은 해시 강도)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 사용자 정보 저장 (배열에 임시 저장)
    sellers.push({ name, username, password: hashedPassword, email, phone, business });

    // 이메일 전송
    const mailOptions = {
        from: '', // 발신자 이메일
        to: email, // 수신자 이메일
        subject: '회원가입 완료 안내',
        text: `안녕하세요, ${name}님! 판매자 회원가입이 완료되었습니다. 감사합니다!`
    };

    // 이메일 전송 성공 실패 여부
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('이메일 전송 오류:', error);
            return res.status(500).send('이메일 전송 중 오류가 발생했습니다.');
        }
        console.log('이메일 전송 성공:', info.response);
    });

    console.log(sellers); // 사용자 목록을 콘솔에 출력 (확인용)
    
    res.send("회원가입이 완료되었습니다! <a href='/login'>로그인 페이지로</a>");
});

//로그인
app.get("/login", (req, res) => {
    res.render("home/login");
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
