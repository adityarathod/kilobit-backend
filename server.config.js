module.exports = {
    development: {
        port: process.env.PORT || 5000,
        saltingRounds: 10,
        mongoConnectionString: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_SERVER}/${process.env.MONGO_NAMESPACE}?retryWrites=true&w=majority`
    }
}