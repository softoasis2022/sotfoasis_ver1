const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5500;

// 이미지 저장 경로 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름을 고유하게 만듭니다.
    },
});

const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// uploads 디렉토리를 static 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let products = [];

// 기본 페이지 라우트
app.get('/', (req, res) => {
    res.send(`
        <h1>상품 등록 API에 오신 것을 환영합니다!</h1>
        <p><a href="/api/products">상품 목록 보기</a></p>
        <p><a href="/register">상품 등록하기</a></p>
    `);
});

// 상품 등록 폼 페이지
app.get('/register', (req, res) => {
    res.send(`
        <h1>상품 등록하기</h1>
        <form action="/api/products" method="POST" enctype="multipart/form-data">
            <label for="name">이름:</label>
            <input type="text" name="name" required><br>
            <label for="description">설명:</label>
            <input type="text" name="description" required><br>
            <label for="price">가격:</label>
            <input type="number" name="price" required><br>
            <label for="image">이미지:</label>
            <input type="file" name="image" required><br>
            <button type="submit">등록</button>
        </form>
        <p><a href="/">홈으로</a></p>
    `);
});

// 상품 등록 엔드포인트 (이미지, 설명, 이름, 가격)
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price || !req.file) {
        return res.status(400).json({ message: '이름, 설명, 가격, 이미지를 모두 입력해주세요.' });
    }

    const newProduct = {
        id: products.length + 1,
        이름: name,
        설명: description,
        가격: parseFloat(price), // 가격을 숫자로 변환
        이미지: `/uploads/${req.file.filename}`, // 이미지 경로를 클라이언트에서 접근 가능한 형태로 저장
    };
    products.push(newProduct);

    return res.status(201).json(newProduct);
});

// 상품 목록 조회 엔드포인트
app.get('/api/products', (req, res) => {
    const productList = products.map(product => ({
        ID: product.id,
        이름: product.이름,
        설명: product.설명,
        가격: product.가격,
        이미지: `<img src="${product.이미지}" alt="${product.이름}" style="max-width: 100px;">`, // 이미지 HTML로 표시
    }));

    res.send(`
        <h1>상품 목록</h1>
        <ul>
            ${productList.map(product => `
                <li>
                    <strong>${product.이름}</strong><br>
                    설명: ${product.설명}<br>
                    가격: ${product.가격}원<br>
                    ${product.이미지}
                </li>
            `).join('')}
        </ul>
        <p><a href="/">홈으로</a></p>
    `);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});