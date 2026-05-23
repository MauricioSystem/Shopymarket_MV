const fs = require('fs');
const path = require('path');
const multer = require('multer');

const profileImgDir = path.join(__dirname, '../uploads/profile_images');
const storeImgDir = path.join(__dirname, '../uploads/store_images');
const productImgDir = path.join(__dirname, '../uploads/product_images');

fs.mkdirSync(profileImgDir, { recursive: true });
fs.mkdirSync(storeImgDir, { recursive: true });
fs.mkdirSync(productImgDir, { recursive: true });

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileImgDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${req.params.id || 'user'}-${timestamp}${ext}`);
    }
});

const storeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storeImgDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        const fieldName = file.fieldname || 'image';
        cb(null, `store-${fieldName}-${timestamp}${ext}`);
    }
});

const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productImgDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `product-${timestamp}${ext}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
        return cb(new Error('Only PNG and JPEG images are allowed'), false);
    }
    cb(null, true);
};

const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 
    }
});

const uploadStoreImage = multer({
    storage: storeStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

module.exports = {
    uploadProfileImage,
    uploadStoreImage,
    uploadProductImage
};
