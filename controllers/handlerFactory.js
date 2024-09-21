const { catchAsync } = require('./../error/error');
const AppError = require('./../error/appError');
const {
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_204_NO_CONTENT,
  HTTP_404_NOT_FOUND,
  SUCCESS,
} = require('./../utils/constant');

exports.deleteByIds = Model =>
  catchAsync(async function (req, res, next) {
    const listIds = req.params.id.split(',');
    const result = await Model.deleteMany({ _id: { $in: listIds } });

    if (result?.acknowledged && result?.deletedCount === 0) {
      return next(
        new AppError(
          `No document found with id '${req.params.id}'`,
          HTTP_404_NOT_FOUND,
        ),
      );
    }

    res.status(HTTP_204_NO_CONTENT).json({
      status: SUCCESS,
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return new document
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          `No document found with id '${req.params.id}'`,
          HTTP_404_NOT_FOUND,
        ),
      );
    }

    res.status(HTTP_200_OK).json({
      status: SUCCESS,
      data: {
        data: doc,
      },
    });
  });

exports.createOne = Model =>
  catchAsync(async function (req, res, next) {
    const doc = await Model.create(req.body);

    res.status(HTTP_201_CREATED).json({
      status: SUCCESS,
      data: {
        data: doc,
      },
    });
  });
