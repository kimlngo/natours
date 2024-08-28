const {
  EXCLUDED_FIELDS,
  DEFAULT_SORT_BY,
  DEFAULT_PROJECTION,
  DEFAULT_PAGE_ONE,
  DEFAULT_LIMIT_PER_PAGE,
} = require('./../utils/constant');

class DataAccessImpl {
  constructor(query, rawQuery) {
    this.query = query;
    this.rawQuery = rawQuery;
  }

  /**
   * Remove excluded keys {@link EXCLUDED_FIELDS} from the rawQuery
   * @returns
   */
  #excludeKeyWords() {
    const queryObj = { ...this.rawQuery };
    EXCLUDED_FIELDS.forEach(ex => delete queryObj[ex]);
    return queryObj;
  }

  /**
   * Util function to split inputStr by , and then join by ' '
   * @param {*} inputStr
   * @returns splitted & joined String
   */
  #splitAndJoin(inputStr) {
    return inputStr.split(',').join(' ');
  }

  /**
   * Exclude keywords and replace equality keys
   * @returns DataAccessImpl Object
   */
  filter() {
    const queryObj = this.#excludeKeyWords();
    const queryObjStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(queryObjStr));
    return this;
  }

  /**
   * Sort Implementation
   * sort(-price -ratingsAverage)
   *
   * accending order: price
   * decending order: -price
   * @returns DataAccessImpl Object
   */
  sort() {
    if (this.rawQuery.sort) {
      this.query = this.query.sort(this.#splitAndJoin(this.rawQuery.sort));
    } else {
      this.query = this.query.sort(DEFAULT_SORT_BY);
    }
    return this;
  }

  /**
   * include a field name => inclusive (e.g: price)
   * include -fieldName => exclusive (e.g: -price)
   * @returns DataAccessImpl Object
   */
  project() {
    if (this.rawQuery.fields) {
      this.query = this.query.select(this.#splitAndJoin(this.rawQuery.fields));
    } else {
      this.query = this.query.select(DEFAULT_PROJECTION);
    }
    return this;
  }

  /**
   * Extract query string page & limit and calculate the skip operator
   *
   * To ensure the result is consistent, the original results should have been sorted based on one or more conditions. For example: original tours are sorted based on the price (low -> high) then apply pagination
   *
   * Otherwise, the order is non-deterministic and pagination will not work as expected (a tour may show up in more than one page).
   * @returns
   */
  paginate() {
    const page = Number(this.rawQuery.page) || DEFAULT_PAGE_ONE;
    const limit = Number(this.rawQuery.limit) || DEFAULT_LIMIT_PER_PAGE;
    /**
     * page 1: 1 - 10
     * page 2: 11 - 20
     * page 3: 21 - 30
     * For page 3: skip = (3 - 1) * 10; => (page - 1) * limit
     */
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = DataAccessImpl;
