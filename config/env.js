const config = {
    development: {
        API_URL: 'http://localhost:5000',
        PAYSTACK_CALLBACK_URL: 'http://localhost:3000/payment-success'
    },
    production: {
        API_URL: 'https://campus-guide-backend-n015.onrender.com',
        PAYSTACK_CALLBACK_URL: 'https://campus-guide-gamma.vercel.app/payment-success'
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];