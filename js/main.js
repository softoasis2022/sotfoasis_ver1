const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cheerio = require('cheerio');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const app = express();
const PORT = 80;

path.join(__dirname,"/../version","page.json");
fs.readFileSync(path.join(__dirname,"/../version","page.json"), 'utf-8');

let pagever = JSON.parse(fs.readFileSync(path.join(__dirname,"/../version","page.json"), 'utf-8'));  //페이지 버전을 json으로 저장 하는 변수



let page; //페이지정보를 보내는 데이터 저장

//데이터 저장 경로
const data_base = path.join("D");
const page_loot = path.join(__dirname,"/../page");


//html 정보가 저장된 루트
const seller_page_loot = path.join(page_loot,"seller");
const seller_pagetaplate_loot = path.join(page_loot,"seller","tamplate");

const meta_page_loot = path.join(page_loot,"meta");
const meta_pagetamplate_loot = path.join(page_loot,"meta","tamplate");

const industry_page_loot = path.join(page_loot,"meta");
const industry_pagetamplate_loot = path.join(page_loot,"meta","tamplate");

/*


*/

// 이미지 저장 경로 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 장바구니 초기화
let products = [];
let cart = [];



// uploads 디렉토리를 static 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 메인 페이지 라우트
app.get('/', (req, res) => {
    const productList = products.map(product => `
        <div class="col-md-4">
            <div class="card mb-4 shadow-sm">
                <img src="${product.이미지}" class="card-img-top" alt="${product.이름}">
                <div class="card-body">
                    <h5 class="card-title">${product.이름}</h5>
                    <p class="card-text">${product.설명}</p>
                    <p class="card-text">가격: ${product.가격}원</p>
                    <form action="/api/cart/add" method="POST" style="display:inline;">
                        <input type="hidden" name="productId" value="${product.id}">
                        <button type="submit" class="btn btn-success">장바구니에 추가</button>
                    </form>
                </div>
            </div>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
            <title>쇼핑몰</title>
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .header {
                    background-color: #fff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <header class="header">
                <div class="container d-flex justify-content-between align-items-center py-3">
                    <div class="logo">MyShopping</div>
                    <input type="text" class="form-control w-50" placeholder="검색어를 입력하세요" aria-label="검색">
                    <a href="/cart" class="btn btn-outline-primary">
                        <i class="fas fa-shopping-cart"></i> 장바구니
                    </a>
                </div>
            </header>
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container">
                    <a class="navbar-brand" href="#">카테고리</a>
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav">
                            <li class="nav-item"><a class="nav-link" href="/api/products">상품 목록</a></li>
                            <li class="nav-item"><a class="nav-link" href="/register">상품 등록</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div class="container">
                <h1 class="text-center">쇼핑몰에 오신 것을 환영합니다!</h1>
                <div class="row">
                    ${productList || '<p>등록된 상품이 없습니다.</p>'}
                </div>
                <div class="text-center">
                    <p><a class="btn btn-primary" href="/api/products">상품 목록 보기</a></p>
                </div>
            </div>
        </body>
        </html>
    `);
});


app.get('/seller', (req, res) => {
    
    let tamplate = path.join();

    page = applyPageToTemplate();


    res.send();
});

// 상품 등록 폼 페이지 seller
app.get('/register', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <title>상품 등록</title>
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>상품 등록하기</h1>
                <form action="/api/products" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="name">이름:</label>
                        <input type="text" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="description">설명:</label>
                        <input type="text" name="description" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="price">가격:</label>
                        <input type="number" name="price" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="image">이미지:</label>
                        <input type="file" name="image" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary">등록</button>
                </form>
                <p><a href="/">홈으로</a></p>
            </div>
        </body>
        </html>
    `);
});

// 상품 등록 엔드포인트 seller
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || !price || !req.file) {
        return res.status(400).json({ message: '이름, 설명, 가격, 이미지를 모두 입력해주세요.' });
    }

    const newProduct = {
        id: products.length + 1,
        이름: name,
        설명: description,
        가격: parseFloat(price),
        이미지: `/uploads/${req.file.filename}`,
    };
    products.push(newProduct);

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <title>상품 등록 완료</title>
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center">상품 등록 완료</h1>
                <div class="alert alert-success" role="alert">
                    상품이 성공적으로 등록되었습니다.
                </div>
                <div class="card mb-4 shadow-sm">
                    <img src="${newProduct.이미지}" alt="${newProduct.이름}" class="card-img-top" style="max-width: 200px;">
                    <div class="card-body">
                        <h5 class="card-title">${newProduct.이름}</h5>
                        <p class="card-text">${newProduct.설명}</p>
                        <p class="card-text">가격: ${newProduct.가격}원</p>
                    </div>
                </div>
                <p><a href="/api/products" class="btn btn-primary">상품 목록으로 돌아가기</a></p>
                <p><a href="/register" class="btn btn-secondary">상품 등록하기</a></p>
                <p><a href="/" class="btn btn-link">홈으로</a></p>
            </div>
        </body>
        </html>
    `);
});
// 상품 목록 조회 엔드포인트 seller
app.get('/api/products', (req, res) => {
    const productList = products.map(product => `
        <div class="col-md-4">
            <div class="card mb-4 shadow-sm">
                <img src="${product.이미지}" class="card-img-top" alt="${product.이름}">
                <div class="card-body">
                    <h5 class="card-title">${product.이름}</h5>
                    <p class="card-text">${product.설명}</p>
                    <p class="card-text">가격: ${product.가격}원</p>
                    <form action="/api/cart/add" method="POST" style="display:inline;">
                        <input type="hidden" name="productId" value="${product.id}">
                        <button type="submit" class="btn btn-success">장바구니에 추가</button>
                    </form>
                </div>
            </div>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <title>상품 목록</title>
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center">상품 목록</h1>
                <div class="row">
                    ${productList || '<p>등록된 상품이 없습니다.</p>'}
                </div>
                <p><a href="/">홈으로</a></p>
            </div>
        </body>
        </html>
    `);
});
// 장바구니에 상품 추가 meta
app.post('/api/cart/add', (req, res) => {
    const { productId } = req.body;
    const product = products.find(p => p.id == productId);

    if (product) {
        cart.push(product);
        res.send(`
            <h1>장바구니에 추가되었습니다!</h1>
            <p>${product.이름}이(가) 장바구니에 추가되었습니다.</p>
            <p><a href="/api/products">상품 목록으로 돌아가기</a></p>
            <p><a href="/">홈으로</a></p>
        `);
    } else {
        return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
});
// 장바구니 조회 엔드포인트 meta
app.get('/cart', (req, res) => {
    if (cart.length === 0) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <title>장바구니</title>
                <style>
                    body {
                        background-color: #f8f9fa;
                    }
                    .container {
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>장바구니가 비어 있습니다.</h1>
                    <p><a href="/">홈으로</a></p>
                </div>
            </body>
            </html>
        `);
    }

    const cartList = cart.map(product => `
        <li class="list-group-item">
            <strong>${product.이름}</strong><br>
            설명: ${product.설명}<br>
            가격: ${product.가격}원<br>
            <img src="${product.이미지}" alt="${product.이름}" style="max-width: 100px;">
        </li>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <title>장바구니</title>
            <style>
                body {
                    background-color: #f8f9fa;
                }
                .container {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>장바구니</h1>
                <ul class="list-group">
                    ${cartList}
                </ul>
                <p><a href="/">홈으로</a></p>
            </div>
        </body>
        </html>
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


// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});

function applyPageToTemplate(templatePath, pagePath) {
    let template = readfile(templatePath);
    let pageContent = readfile(pagePath);
    const mainPageRegex = /<div id="mainpage"><\/div>/;
    return template.replace(mainPageRegex, `<div id="mainpage">${pageContent}</div>`);
}
function readfile(templatePath) {
    return fs.readFileSync(templatePath, 'utf-8');
}
