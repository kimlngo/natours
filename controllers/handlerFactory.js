const { catchAsync } = require('./../error/error');
const AppError = require('./../error/appError');
const {
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_204_NO_CONTENT,
  HTTP_404_NOT_FOUND,
  SUCCESS,
} = require('./../utils/constant');
const DataAccessImpl = require('./../data-access/dataAccess');

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

exports.getOne = (Model, populateOpts) =>
  catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id);
    if (populateOpts) query = query.populate(populateOpts);

    const doc = await query;

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

exports.getAll = Model =>
  catchAsync(async function (req, res, next) {
    //To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const rawQuery = req.query;
    const dataAccessImpl = new DataAccessImpl(Model.find(filter), rawQuery);

    //query preparation
    //prettier-ignore
    dataAccessImpl.filter()
                    .sort()
                    .project()
                    .paginate();

    //EXECUTE query
    // const doc = await dataAccessImpl.query.explain();
    const doc = await dataAccessImpl.query;

    //SEND Response
    res.status(HTTP_200_OK).json({
      status: SUCCESS,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
