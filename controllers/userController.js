const {
  SUCCESS,
  HTTP_200_OK,
  HTTP_204_NO_CONTENT,
  HTTP_400_BAD_REQUEST,
  HTTP_500_INTERNAL_ERROR,
} = require('./../utils/constant');

//Constant
const UserModel = require('./../models/userModel');
const { catchAsync } = require('./../error/error');
const handlerFactory = require('./handlerFactory');
const AppError = require('./../error/appError');
const sharp = require('sharp');
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, STORAGE_LOCATION);
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const fileName = `user-${req.user.id}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   },
// });

//keep the photo in memory and use it for resizing
const multerStorage = multer.memoryStorage();

//User filter to check if uploading file is expected type (e.g., image)
//yes -> proceed | no -> reject
//prettier-ignore
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload images only!', HTTP_400_BAD_REQUEST), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) //90%
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObject = function (obj, ...allowedFields) {
  const filteredObj = {};
  allowedFields.forEach(field => {
    if (obj[field]) filteredObj[field] = obj[field];
  });
  return filteredObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if you POSTS password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        HTTP_400_BAD_REQUEST,
      ),
    );
  }
  //2) filter to only update allowed fields thenu pdate user document
  const filterBody = filterObject(req.body, 'name', 'email');

  //attach uploading photo if any
  if (req.file) filterBody.photo = req.file.filename;

  const user = await UserModel.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(HTTP_204_NO_CONTENT).json({
    status: SUCCESS,
    data: null,
  });
});

exports.createNewUser = (req, res) => {
  res.status(HTTP_500_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not defined. Please use /signup instead',
  });
};

//getMe implementation
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = handlerFactory.getAll(UserModel);

exports.getUserById = handlerFactory.getOne(UserModel);

//Do NOT update passwords with this
exports.updateUser = handlerFactory.updateOne(UserModel);

exports.deleteUserById = handlerFactory.deleteByIds(UserModel);
