import axios from 'axios';
import { showAlert } from './alert';

//prettier-ignore

export const bookTour = async function (tourId) {
  try {
    const stripe = Stripe('pk_test_51Q6DqAHOZnGsE4kVTFoKfPFFNQUvowUuoy4Ml3spMiOmRhjJqpSbPVMRFvC3s89L9UnC5OWE2Au8EwCVxa1RfBiH00NHNQw48C');
    //1) get checkout session from API
    const res = await axios(
      `http://localhost:8080/api/v1/bookings/checkout-session/${tourId}`,
    );

    await stripe.redirectToCheckout({
      sessionId: res.data.session.id,
    });

    //2) Create checkout form + charge credit card
  } catch (err) {
    showAlert('error', err);
  }
};
