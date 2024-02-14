import { Router } from 'express';
import { peopleRoute } from './people';
import { groupsRoute } from './groups';
import { serviceRoute } from './service';

export const routes = Router();

routes.use('/people', peopleRoute);
routes.use('/groups', groupsRoute);
routes.use('/service', serviceRoute);
