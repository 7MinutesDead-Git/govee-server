import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'


dotenv.config({ path: './config/.env' })
const app = express()
app.use(express.static('public'))

app.get('/api', (req, res) => {
    const response = axios.get('https://api.github.com/users/bradtraversy')
})

app.listen(3001, () => {
    console.log('Server listening on port 3001')
})