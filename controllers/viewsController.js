const { HTTP_200_OK } = require('./../utils/constant');

exports.getOverview = (req, res) => {
  res.status(HTTP_200_OK).render('overview', {
    title: 'All Tours',
  });
};

exports.getTourDetail = (req, res) => {
  res.status(HTTP_200_OK).render('tour', {
    title: 'The Forest Hiker',
  });
};
