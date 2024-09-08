const {
  HTTP_INTERNAL_ERROR,
  HTTP_200_OK,
  SUCCESS,
} = require('./../utils/constant');
const UserModel = require('./../models/userModel');
const { catchAsync } = require('./../error/error');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  //EXECUTE query
  const users = await UserModel.find();

  //SEND Response
  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    results: users.length,
    data: {
      tours: users,
    },
  });
});

exports.createNewUser = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

exports.getUserById = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
exports.updateUser = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

exports.deleteUserById = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
