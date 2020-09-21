const app = require('./app');

const id = 'RBXuwTZsEQXfFN0D';

app.stop(id)
.then(console.log)
.catch(console.error);