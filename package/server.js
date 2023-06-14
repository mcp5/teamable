const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb')
const { isInvalidEmail, isEmptyPayload } = require('./validator')

const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)
const dbName = 'company-db'
const colName = 'employees'

app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/dist'))

app.get('/get-profile', async function(req, res) {
    //connects to the database
    await client.connect()
    console.log('Connected successfully to server')

    //initiate or get the db and collection
    const db = client.db(dbName)
    const collection = db.collection(colName)

    // get data from database
    const result = await collection.findOne({id: 1})
    console.log(result)
    client.close()

    response = {}
    
    if (result !== null) {
        response = {
            name: result.name,
            email: result.email,
            interest: result.interest
        }  
    }

    res.send(response)
})

app.post('/update-profile', async function(req, res) {
    const payload = req.body
    console.log(payload)

    if (isEmptyPayload(payload) || isInvalidEmail(payload)) {
        res.send ({error: "empty payload.  Couldn't update user"})
    } else {
        //connect to mongodb 
        await client.connect()
        console.log('Connected successfully to server')

        //initiate or get the db and collection
        const db = client.db(dbName)
        const collection = db.collection(colName)
    
        // save payload data to the database
        payload['id'] = 1;
        const updatedValues = { $set: payload }
        await collection.updateOne({id: 1}, updatedValues, {upsert: true});
        client.close()

        res.send({info: "user profile data updated successfully"})
    }    
})

const server = app.listen(3000, function () {
    console.log("app listening on port 3000")
})

module.exports = {
    app,
    server
}