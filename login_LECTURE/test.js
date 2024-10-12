"use strict";
// 라이브러리
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // 비밀번호 암호화
const nodemailer = require('nodemailer'); //메일 발송

const app = express();
const port = 5500;

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

// 로그인 처리
app.post("/login", async (req, res) => {
    const { username, password, userType } = req.body;
    
    // 배열에서 사용자 찾기
    let user;
    
    if (userType === 'customer') {          // 구매자 배열에서 사용자 찾기
        user = customers.find(u => u.username === username);
    } 
    else if (userType === 'seller') {       // 판매자 배열에서 사용자 찾기
        user = sellers.find(u => u.username === username);
    }
    
    if (!user) {                            // 사용자를 못 찾았을때
        return res.status(400).send(`
            아이디 또는 비밀번호가 잘못되었습니다.<br>
            <a href='/login'><button>로그인 페이지로 이동하기</button></a>
        `);
    }

    // 비밀번호 확인 (입력된 비밀번호와 해시된 비밀번호 비교)
    const Match = await bcrypt.compare(password, user.password);

    if (userType === 'customer') {
        res.render("home/customer_main", { name: user.name });      //구매자 매인 페이지로
    } 
    else if (userType === 'seller') {
        res.render("home/seller_main", { name: user.name });        //판매자 매인 페이지로
    }
    else {
        res.status(400).send(`
            아이디 또는 비밀번호가 잘못되었습니다.<br>
            <a href='/login'><button>로그인 페이지로 이동하기</button></a>
        `); //비밀번호 오류
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
