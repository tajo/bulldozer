import compression from 'compression';
import express from 'express';
import bodyParser from 'body-parser';

export default function(config, program) {

  console.log(config);
  config.apps.app1.preDeploy();

  const app = express();
  const router = express.Router();
  app.use(compression());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  router.route('/deploy');

  router.route('*')
    .all(function(req, res) {
      console.log(req);
      res.status(404);
    });

  app.use('/', router);
  app.listen(config.port);

  console.log(`Bulldozer started on port {$config.port}`);
}
