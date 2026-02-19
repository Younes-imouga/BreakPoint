export default () => {
    return {
        database: {
            url: process.env.MONGODB_URI,
        },
        jwt: {
            secret: process.env.JWT_SECRET,
        }
    }
}