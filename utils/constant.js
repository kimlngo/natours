//ENVIRONMENT
exports.DEV = 'development';
exports.PROD = 'production';
exports.ENV = process.env;

//HTTP CODES
exports.HTTP_200_OK = 200;
exports.HTTP_201_CREATED = 201;
exports.HTTP_204_NO_CONTENT = 204;
exports.HTTP_400_BAD_REQUEST = 400;
exports.HTTP_401_UNAUTHORIZED = 401;
exports.HTTP_403_FORBIDDEN = 403;
exports.HTTP_404_NOT_FOUND = 404;
exports.HTTP_500_INTERNAL_ERROR = 500;

//SUCCESS/FAILURE
exports.SUCCESS = 'success';
exports.FAIL = 'fail';
exports.ERROR = 'error';

//USER ROLES
exports.ADMIN = 'admin';
exports.USER = 'user';
exports.GUIDE = 'guide';
exports.LEAD_GUIDE = 'lead-guide';

//MIDDLEWARE
exports.EXCLUDED_FIELDS = ['page', 'sort', 'limit', 'fields'];
exports.DEFAULT_SORT_BY = 'price';
exports.DEFAULT_PROJECTION = '-__v';
exports.DEFAULT_PAGE_ONE = 1;
exports.DEFAULT_LIMIT_PER_PAGE = 10;
