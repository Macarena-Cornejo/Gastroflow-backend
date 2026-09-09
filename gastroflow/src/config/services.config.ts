export default () => ({
    services: {
        userService: process.env.USER_SERVICE_URL || 'http://localhost:3003',
        axiosService: process.env.AXIOS_SERVICE_URL || 'http://localhost:3001',
        expressService: process.env.EXPRESS_SERVICE_URL || 'http://localhost:3002',
        pythonService: process.env.PYTHON_SERVICE_URL || 'http://localhost:3004',
    },
});