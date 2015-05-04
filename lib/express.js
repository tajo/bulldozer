import compression from 'compression';
import express from 'express';
import bodyParser from 'body-parser';
import getRemote from './remotes';
import deployZip from './deploy';
import utils, {md5} from './utils';

export default function(config, program) {
  if (!config) {
    return;
  }

  const app = express();
  const router = express.Router();
  app.use(compression());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  router.route('/deploy/:tag').get((req, res) => {
    if (decodeURI(req.query.secret) !== md5(config.secret)) {
      res.status(403).json({message: 'The secret key is wrong! The bulldozer server refuses to communicate!'});
      return;
    } else {
      deploy(config, req.params.tag);
      res.json({message: `Deploy of tag ${req.params.tag} has started.`});
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

function deploy(config, tagName) {
  if (config.preDeploy(utils)) {
    deployZip(getRemote(config.gitUrl, config.name, tagName), config);
  }
}


