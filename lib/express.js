import compression from 'compression';
import express from 'express';
import bodyParser from 'body-parser';

export default function(config, program) {
  if (!config) {
    return;
  }

  config.preDeploy();

  const app = express();
  const router = express.Router();
  app.use(compression());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  router.route('/deploy/:tag').get((req, res) => {
    const tagName = req.params.tag;
    if (decodeURI(req.query.secret) !== config.secret) {
      res.status(403).json({message: 'The secret key is wrong! Permission denied!'});
      return;
    } else {
      res.json({message: `Deploy of tag ${tagName} has started.`});
    }
  });

  router.route('*')
    .all(function(req, res) {
      console.log(req);
      res.status(404);
    });

  app.use('/', router);
  app.listen(config.port);

  console.log(`Bulldozer deployment server started on port ${config.port}`);
}
