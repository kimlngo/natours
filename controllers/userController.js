const {
  SUCCESS,
  HTTP_200_OK,
  HTTP_204_NO_CONTENT,
  HTTP_400_BAD_REQUEST,
  HTTP_500_INTERNAL_ERROR,
} = require('./../utils/constant');
const UserModel = require('./../models/userModel');
const { catchAsync } = require('./../error/error');
const handlerFactory = require('./handlerFactory');
const AppError = require('./../error/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  //EXECUTE query
  const users = await UserModel.find();

  //SEND Response
  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    results: users.length,
    data: {
      users,
    },
  });
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
  const filteredObj = filterObject(req.body, 'name', 'email');
  const user = await UserModel.findByIdAndUpdate(req.user.id, filteredObj, {
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
    message: 'This route is not yet implemented',
  });
};

exports.getUserById = (req, res) => {
  res.status(HTTP_500_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
exports.updateUser = (req, res) => {
  res.status(HTTP_500_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

exports.deleteUserById = handlerFactory.deleteByIds(UserModel);
