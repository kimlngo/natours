const TourModel = require('./../models/tourModel');
const {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_NO_CONTENT,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  SUCCESS,
  FAIL,
} = require('./../utils/constant');

const EXCLUDED_FIELDS = ['page', 'sort', 'limit', 'fields'];
const DEFAULT_SORT_BY = '-createdAt';
const DEFAULT_PROJECTION = '-__v';
/**
 * Remove excluded keys {@link EXCLUDED_FIELDS} from the rawQuery
 * @param {*} rawQuery
 * @returns query object after removal
 */
function excludeKeyWords(rawQuery) {
  const queryObj = { ...rawQuery };
  EXCLUDED_FIELDS.forEach(ex => delete queryObj[ex]);
  return queryObj;
}

/**
 * Replace the gte|gt|lte|lt with $gte|$gt|$lte|$lt
 * @param {*} queryObj
 * @returns query object after replacement
 */
function enhanceFilter(queryObj) {
  let queryStr = JSON.stringify(queryObj);
  return JSON.parse(
    queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`),
  );
}

/**
 * Sort Implementation
 * sort(-price -ratingsAverage)
 * accending order: price
 * decending order: -price
 * @param {*} sort
 * @param {*} query
 * @returns sortedQuery
 */
function sort(sort, query) {
  //prettier-ignore
  return sort 
    ? query.sort(splitAndJoin(sort)) 
    : query.sort(DEFAULT_SORT_BY);
}

/**
 * Fields Projection
 * include a field name => inclusive (e.g: price)
 * include -fieldName => exclusive (e.g: -price)
 * @param {*} fields
 * @param {*} query
 * @returns projectedQuery
 */
function fieldsProjection(fields, query) {
  return fields
    ? query.select(splitAndJoin(fields))
    : query.select(DEFAULT_PROJECTION);
}

/**
 * Util function to split inputStr by , and then join by ' '
 * @param {*} inputStr
 * @returns splitted & joined String
 */
function splitAndJoin(inputStr) {
  return inputStr.split(',').join(' ');
}
exports.getAllTours = async function (req, res) {
  try {
    const rawQuery = req.query;
    console.log('rawQuery:', rawQuery);

    //BUILD QUERY
    //1A)EXCLUDE reserved keywords
    const queryObj = excludeKeyWords(rawQuery);

    //1B)FILTER greater/less than conditions
    const enhanceQueryObj = enhanceFilter(queryObj);
    let query = TourModel.find(enhanceQueryObj);

    //2)SORT Implementation
    query = sort(rawQuery.sort, query);

    //3)Fields Projection
    query = fieldsProjection(rawQuery.fields, query);

    //EXECUTE query
    const tours = await query;

    //SEND Response
    res.status(HTTP_OK).json({
      status: SUCCESS,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not load the tours!',
    });
  }
};

exports.getTourById = async function (req, res) {
  try {
    const tour = await TourModel.findById(req.params.id);
    // const tour = await Tour.findOne({_id: req.params.id});

    if (!tour) throw new Error('Tour NOT FOUND');
    res.status(HTTP_OK).json({
      status: SUCCESS,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not load the tours!',
    });
  }
};

exports.createNewTour = async function (req, res) {
  try {
    const newTour = await TourModel.create(req.body);

    res.status(HTTP_CREATED).json({
      status: SUCCESS,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(HTTP_BAD_REQUEST).json({
      status: FAIL,
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = async function (req, res) {
  try {
    const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return new document
      runValidators: true,
    });

    res.status(HTTP_OK).json({
      status: SUCCESS,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not update tour!',
    });
  }
};

exports.deleteTourById = async function (req, res) {
  try {
    await TourModel.findByIdAndDelete(req.params.id);

    res.status(HTTP_NO_CONTENT).json({
      status: SUCCESS,
      data: null,
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not delete tour!',
    });
  }
};
