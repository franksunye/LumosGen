const express = require('express');
const _ = require('lodash');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const data = {
        message: 'Hello from Test Project!',
        timestamp: new Date().toISOString(),
        features: ['Feature 1', 'Feature 2', 'Feature 3']
    };
    
    res.json(_.pick(data, ['message', 'timestamp', 'features']));
});

app.listen(port, () => {
    console.log(`Test project listening at http://localhost:${port}`);
});

module.exports = app;
