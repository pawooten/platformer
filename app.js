 express = require('express');

let app = express();

const staticDirectories = [ 'audio', 'data', 'images', 'js', 'wwwroot'];
staticDirectories.forEach(directory => {
  app.use(express.static(directory));
});

const port = 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
