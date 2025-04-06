const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const math = require('mathjs');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { correlation: null, error: null });
});

app.post('/correlate', async (req, res) => {
    const { stock1, stock2 } = req.body;

    try {
        const period = { period1: '2023-01-01', interval: '1d' };
        const data1 = await yahooFinance.historical(stock1, period);
        const data2 = await yahooFinance.historical(stock2, period);

        const close1 = data1.map(d => d.close).slice(0, 100).reverse();
        const close2 = data2.map(d => d.close).slice(0, 100).reverse();

        if (close1.length !== close2.length) throw new Error("Mismatched data length");

        const correlation = math.corr(close1, close2);
        res.render('index', { correlation, stock1: stock1, stock2: stock2, error: null });
    } catch (err) {
        res.render('index', { correlation: null, error: 'Error fetching or calculating data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
