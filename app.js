 express = require('express');

let app = express();

const staticDirectories = [ 'audio', 'data', 'images', 'js', 'wwwroot'];
staticDirectories.forEach(directory => {
  app.use(express.static(directory));
});
// app.use(express.static('audio'));
// app.use(express.static('data'));
// app.use(express.static('images'));
// app.use(express.static('js'));
// app.use(express.static('wwwroot'));

const port = 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
