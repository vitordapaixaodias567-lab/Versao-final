const express = require('express');
const app = express();
const pessoasRouter= require('./api');

app.use(express.json());
app.use('/pessoas', pessoasRouter);

app.listen(3000, () => {
    console.log(`Server Iniciado com sucesso! http://localhost:3000`);
})