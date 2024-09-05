const { catchAsync } = require('../error/error');
const { HTTP_201_CREATED, SUCCESS } = require('../utils/constant');

const UserModel = require('./../models/userModel');

exports.signUp = catchAsync(async function (req, res, next) {
  const newUser = await UserModel.create(req.body);

  res.status(HTTP_201_CREATED).json({
    status: SUCCESS,
    data: {
      user: newUser,
    },
  });
});
